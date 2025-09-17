from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from typing import Dict, List, Set
import re

class RBACMiddleware(BaseHTTPMiddleware):
    """Role-Based Access Control middleware for endpoint authorization."""

    # Define route permissions mapping
    ROUTE_PERMISSIONS: Dict[str, Dict[str, str]] = {
        # User routes
        "/api/users/profile": {
            "GET": "read_own_profile",
            "PUT": "update_own_profile",
            "PATCH": "update_own_profile"
        },
        "/api/users/bookings": {
            "GET": "read_own_bookings"
        },

        # Booking routes
        "/api/bookings": {
            "GET": "read_own_bookings",
            "POST": "create_booking"
        },
        "/api/bookings/{booking_id}": {
            "GET": "read_own_bookings",
            "PUT": "cancel_own_booking",
            "DELETE": "cancel_own_booking"
        },
        "/api/bookings/{booking_id}/accept": {
            "POST": "accept_booking"
        },
        "/api/bookings/{booking_id}/reject": {
            "POST": "reject_booking"
        },
        "/api/bookings/{booking_id}/status": {
            "PUT": "update_booking_status"
        },

        # Bouncer routes
        "/api/bouncers/profile": {
            "GET": "read_bouncer_profile",
            "PUT": "update_bouncer_profile",
            "PATCH": "update_bouncer_profile"
        },
        "/api/bouncers/availability": {
            "GET": "manage_availability",
            "POST": "manage_availability",
            "PUT": "manage_availability"
        },
        "/api/bouncers/bookings": {
            "GET": "read_assigned_bookings"
        },

        # Admin routes - require specific admin permissions
        "/api/admin/users": {
            "GET": "manage_users",
            "POST": "manage_users"
        },
        "/api/admin/users/{user_id}": {
            "GET": "manage_users",
            "PUT": "manage_users",
            "DELETE": "manage_users"
        },
        "/api/admin/bouncers": {
            "GET": "manage_bouncers",
            "POST": "manage_bouncers"
        },
        "/api/admin/bookings": {
            "GET": "manage_bookings"
        },
        "/api/admin/reports": {
            "GET": "view_reports"
        },

        # Review routes
        "/api/bookings/{booking_id}/review": {
            "POST": "create_review"
        }
    }

    # Routes that bypass RBAC (already authenticated via AuthMiddleware)
    EXEMPT_ROUTES = {
        "/",
        "/health",
        "/api/docs",
        "/api/redoc",
        "/openapi.json",
        "/api/auth/login",
        "/api/auth/register",
        "/api/auth/refresh",
        "/api/auth/logout",
        "/api/auth/forgot-password",
        "/api/auth/reset-password",
    }

    def _normalize_path(self, path: str) -> str:
        """Normalize path by replacing path parameters with placeholders."""
        # Replace UUID patterns with placeholder
        uuid_pattern = r'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'
        normalized = re.sub(uuid_pattern, '{id}', path, flags=re.IGNORECASE)

        # Replace other common ID patterns
        id_patterns = [
            (r'/\d+(?=/|$)', '/{id}'),  # Numeric IDs
            (r'/[^/]+(?=/|$)', '/{id}')  # Generic path parameters (last resort)
        ]

        for pattern, replacement in id_patterns:
            if '{id}' not in normalized:  # Only if UUID pattern didn't match
                normalized = re.sub(pattern, replacement, normalized, count=1)

        return normalized

    def _get_required_permission(self, path: str, method: str) -> str:
        """Get the required permission for a given path and method."""
        # First try exact match
        if path in self.ROUTE_PERMISSIONS:
            return self.ROUTE_PERMISSIONS[path].get(method)

        # Try normalized path (with path parameters)
        normalized_path = self._normalize_path(path)
        if normalized_path in self.ROUTE_PERMISSIONS:
            return self.ROUTE_PERMISSIONS[normalized_path].get(method)

        # Check for pattern matches
        for route_pattern, methods in self.ROUTE_PERMISSIONS.items():
            if '{' in route_pattern:  # Pattern route
                # Convert pattern to regex
                regex_pattern = route_pattern.replace('{booking_id}', r'[^/]+')
                regex_pattern = regex_pattern.replace('{user_id}', r'[^/]+')
                regex_pattern = regex_pattern.replace('{id}', r'[^/]+')
                regex_pattern = f"^{regex_pattern}$"

                if re.match(regex_pattern, path):
                    return methods.get(method)

        return None

    async def dispatch(self, request: Request, call_next):
        # Skip RBAC for exempt routes
        if request.url.path in self.EXEMPT_ROUTES:
            return await call_next(request)

        # Skip for OPTIONS requests
        if request.method == "OPTIONS":
            return await call_next(request)

        # Get user permissions from request state (set by AuthMiddleware)
        user_permissions: List[str] = getattr(request.state, 'permissions', [])
        user_role: str = getattr(request.state, 'user_role', None)

        # Get required permission for this route
        required_permission = self._get_required_permission(request.url.path, request.method)

        if required_permission:
            # Check if user has the required permission
            if required_permission not in user_permissions:
                return JSONResponse(
                    status_code=status.HTTP_403_FORBIDDEN,
                    content={
                        "detail": f"Insufficient permissions. Required: {required_permission}",
                        "required_permission": required_permission,
                        "user_permissions": user_permissions
                    }
                )

        # Add permission context to request state for use in route handlers
        request.state.required_permission = required_permission

        return await call_next(request)