from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User

bouncers_router = APIRouter()

@bouncers_router.get("/")
async def get_bouncers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return {"message": "Bouncers endpoint", "user": current_user.email}

@bouncers_router.get("/available")
async def get_available_bouncers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return {"message": "Available bouncers endpoint"}