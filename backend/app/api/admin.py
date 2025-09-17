from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User

admin_router = APIRouter()

@admin_router.get("/dashboard")
async def get_admin_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    return {"message": "Admin dashboard", "user": current_user.email}

@admin_router.get("/reports")
async def get_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    return {"message": "Admin reports"}