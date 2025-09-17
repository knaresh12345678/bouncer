from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User

bookings_router = APIRouter()

@bookings_router.get("/")
async def get_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return {"message": "Bookings endpoint", "user": current_user.email}

@bookings_router.post("/")
async def create_booking(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return {"message": "Create booking endpoint"}