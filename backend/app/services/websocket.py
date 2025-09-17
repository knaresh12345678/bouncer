import socketio
from typing import Dict, List
import json
import redis
from app.core.config import settings
from app.core.security import verify_token
import logging

logger = logging.getLogger(__name__)

# Create Socket.IO server
sio = socketio.AsyncServer(
    cors_allowed_origins=settings.ALLOWED_HOSTS,
    async_mode='asgi'
)

# Redis client for session storage and pub/sub
redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)

# In-memory storage for active connections (room management)
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, Dict] = {}  # sid -> user_info
        self.user_rooms: Dict[str, List[str]] = {}     # user_id -> [room_names]

    def add_connection(self, sid: str, user_id: str, user_role: str):
        """Add a new connection."""
        self.active_connections[sid] = {
            'user_id': user_id,
            'user_role': user_role
        }

        if user_id not in self.user_rooms:
            self.user_rooms[user_id] = []

        # Join user to their personal room
        self.user_rooms[user_id].append(f"user_{user_id}")

        # Join role-based rooms
        if user_role == 'admin':
            self.user_rooms[user_id].extend(['admin_room', 'all_bookings', 'all_notifications'])
        elif user_role == 'bouncer':
            self.user_rooms[user_id].extend(['bouncer_room', 'booking_requests'])
        elif user_role == 'user':
            self.user_rooms[user_id].append('user_room')

    def remove_connection(self, sid: str):
        """Remove a connection."""
        if sid in self.active_connections:
            user_id = self.active_connections[sid]['user_id']
            del self.active_connections[sid]

            # Check if user has other connections
            user_still_connected = any(
                conn['user_id'] == user_id
                for conn in self.active_connections.values()
            )

            if not user_still_connected and user_id in self.user_rooms:
                del self.user_rooms[user_id]

    def get_user_rooms(self, user_id: str) -> List[str]:
        """Get rooms for a user."""
        return self.user_rooms.get(user_id, [])

    def get_connection_info(self, sid: str) -> Dict:
        """Get connection info for a session."""
        return self.active_connections.get(sid, {})

manager = ConnectionManager()

@sio.event
async def connect(sid, environ, auth):
    """Handle client connection."""
    try:
        # Authenticate user
        if not auth or 'token' not in auth:
            logger.warning(f"Connection {sid} rejected: No auth token")
            return False

        # Verify JWT token
        payload = verify_token(auth['token'], 'access')
        user_id = payload.get('sub')
        user_role = payload.get('role')
        user_email = payload.get('email')

        if not user_id or not user_role:
            logger.warning(f"Connection {sid} rejected: Invalid token payload")
            return False

        # Add connection to manager
        manager.add_connection(sid, user_id, user_role)

        # Join user to their rooms
        rooms = manager.get_user_rooms(user_id)
        for room in rooms:
            await sio.enter_room(sid, room)

        logger.info(f"User {user_email} ({user_role}) connected: {sid}")

        # Send connection confirmation
        await sio.emit('connected', {
            'message': 'Connected successfully',
            'user_id': user_id,
            'rooms': rooms
        }, room=sid)

        # Notify about pending notifications
        await send_pending_notifications(user_id)

        return True

    except Exception as e:
        logger.error(f"Connection error for {sid}: {str(e)}")
        return False

@sio.event
async def disconnect(sid):
    """Handle client disconnection."""
    conn_info = manager.get_connection_info(sid)
    if conn_info:
        user_id = conn_info.get('user_id')
        logger.info(f"User {user_id} disconnected: {sid}")

    manager.remove_connection(sid)

@sio.event
async def join_booking_room(sid, data):
    """Join a specific booking room for real-time updates."""
    try:
        conn_info = manager.get_connection_info(sid)
        if not conn_info:
            return {'error': 'Not authenticated'}

        booking_id = data.get('booking_id')
        if not booking_id:
            return {'error': 'Booking ID required'}

        # TODO: Verify user has access to this booking
        room_name = f"booking_{booking_id}"
        await sio.enter_room(sid, room_name)

        return {'success': True, 'room': room_name}

    except Exception as e:
        logger.error(f"Error joining booking room: {str(e)}")
        return {'error': 'Failed to join room'}

@sio.event
async def leave_booking_room(sid, data):
    """Leave a booking room."""
    try:
        booking_id = data.get('booking_id')
        if booking_id:
            room_name = f"booking_{booking_id}"
            await sio.leave_room(sid, room_name)
            return {'success': True}

    except Exception as e:
        logger.error(f"Error leaving booking room: {str(e)}")
        return {'error': 'Failed to leave room'}

# Helper functions for emitting events

async def notify_booking_status_change(booking_id: str, old_status: str, new_status: str, changed_by: str):
    """Notify about booking status changes."""
    event_data = {
        'booking_id': booking_id,
        'old_status': old_status,
        'new_status': new_status,
        'changed_by': changed_by,
        'timestamp': str(datetime.utcnow())
    }

    # Notify specific booking room
    await sio.emit('booking_status_changed', event_data, room=f"booking_{booking_id}")

    # Notify admin room
    await sio.emit('booking_status_changed', event_data, room='admin_room')

async def notify_new_booking_request(booking_id: str, bouncer_id: str, booking_data: dict):
    """Notify bouncer about new booking request."""
    event_data = {
        'booking_id': booking_id,
        'user_name': f"{booking_data.get('user_first_name', '')} {booking_data.get('user_last_name', '')}",
        'event_name': booking_data.get('event_name'),
        'start_datetime': booking_data.get('start_datetime'),
        'location': booking_data.get('event_location_address'),
        'timestamp': str(datetime.utcnow())
    }

    # Notify specific bouncer
    await sio.emit('new_booking_request', event_data, room=f"user_{bouncer_id}")

    # Notify all bouncers room
    await sio.emit('new_booking_request', event_data, room='bouncer_room')

async def notify_new_message(conversation_id: str, sender_id: str, sender_name: str, message: str, recipients: List[str]):
    """Notify about new messages."""
    event_data = {
        'conversation_id': conversation_id,
        'sender_id': sender_id,
        'sender_name': sender_name,
        'message': message,
        'timestamp': str(datetime.utcnow())
    }

    # Notify all recipients
    for recipient_id in recipients:
        await sio.emit('new_message', event_data, room=f"user_{recipient_id}")

async def send_notification(user_id: str, title: str, message: str, notification_type: str, data: dict = None):
    """Send notification to a specific user."""
    event_data = {
        'title': title,
        'message': message,
        'type': notification_type,
        'data': data or {},
        'timestamp': str(datetime.utcnow())
    }

    await sio.emit('notification', event_data, room=f"user_{user_id}")

async def send_pending_notifications(user_id: str):
    """Send any pending notifications for a user."""
    try:
        # TODO: Fetch unread notifications from database
        # This is a placeholder - implement actual database query
        pass
    except Exception as e:
        logger.error(f"Error sending pending notifications: {str(e)}")

# Admin broadcast functions

async def broadcast_to_role(role: str, event: str, data: dict):
    """Broadcast message to all users with a specific role."""
    room_name = f"{role}_room"
    await sio.emit(event, data, room=room_name)

async def broadcast_system_maintenance(message: str, start_time: str, duration: int):
    """Broadcast system maintenance notification."""
    event_data = {
        'message': message,
        'start_time': start_time,
        'duration_minutes': duration,
        'type': 'system_maintenance'
    }

    # Broadcast to all connected users
    await sio.emit('system_notification', event_data)