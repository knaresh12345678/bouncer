from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.core.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
import uuid

bookings_router = APIRouter()

class BookingRequestCreate(BaseModel):
    eventName: str
    location: str
    date: str
    time: str
    price: float
    description: Optional[str] = ""

class BookingRequestResponse(BaseModel):
    id: str
    eventName: str
    location: str
    date: str
    time: str
    price: float
    description: str
    userId: str
    status: str
    createdAt: str

# In-memory storage for booking requests (in a real app, this would be in the database)
booking_requests = []

@bookings_router.get("/")
async def get_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Return user's booking requests
    user_requests = [req for req in booking_requests if req["userId"] == str(current_user.id)]
    return {"bookings": user_requests, "user": current_user.email}

@bookings_router.post("/", response_model=BookingRequestResponse)
async def create_booking_request(
    booking_data: BookingRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new booking request"""
    try:
        # Validate required fields
        if not booking_data.eventName.strip():
            raise HTTPException(status_code=400, detail="Event name is required")
        if not booking_data.location.strip():
            raise HTTPException(status_code=400, detail="Location is required")
        if not booking_data.date:
            raise HTTPException(status_code=400, detail="Date is required")
        if not booking_data.time:
            raise HTTPException(status_code=400, detail="Time is required")
        if booking_data.price <= 0:
            raise HTTPException(status_code=400, detail="Price must be greater than 0")

        # Create new booking request
        new_request = {
            "id": str(uuid.uuid4()),
            "eventName": booking_data.eventName.strip(),
            "location": booking_data.location.strip(),
            "date": booking_data.date,
            "time": booking_data.time,
            "price": booking_data.price,
            "description": booking_data.description or "",
            "userId": str(current_user.id),
            "status": "pending",
            "createdAt": datetime.now().isoformat()
        }

        # Store the request (in a real app, save to database)
        booking_requests.append(new_request)

        return BookingRequestResponse(**new_request)

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creating booking request: {e}")
        raise HTTPException(status_code=500, detail="Failed to create booking request")

@bookings_router.get("/all")
async def get_all_booking_requests():
    """Get all booking requests for bouncer dashboard"""
    return {"requests": booking_requests}