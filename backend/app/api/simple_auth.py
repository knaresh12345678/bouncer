from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import select
from datetime import timedelta

from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token, verify_token
from app.models.user import User, Role
from app.schemas.auth import UserLogin, UserRegister, TokenResponse, UserResponse
from app.schemas.user import UserCreate

simple_auth_router = APIRouter()

async def get_user_by_email(db: Session, email: str):
    """Get user by email with role."""
    stmt = select(User).where(User.email == email)
    result = db.execute(stmt)
    return result.scalar_one_or_none()

@simple_auth_router.post("/login", response_model=TokenResponse)
async def simple_login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Simple login user and return JWT tokens without database updates."""
    # Get user by email
    user = await get_user_by_email(db, form_data.username)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Verify password
    if not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is deactivated"
        )

    # Create tokens
    token_data = {
        "sub": str(user.id),
        "email": user.email,
        "role": user.role.name if user.role else None,
        "permissions": []  # Simple version without permissions
    }

    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token({"sub": str(user.id)})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=1800,  # 30 minutes
        user=UserResponse(
            id=user.id,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            phone=user.phone,
            role=user.role.name if user.role else None,
            is_active=user.is_active,
            is_verified=user.is_verified,
            created_at=user.created_at
        )
    )