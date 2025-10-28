from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from datetime import timedelta

from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token, verify_token
from app.models.user import User, Role
from app.schemas.auth import UserLogin, UserRegister, TokenResponse, UserResponse
from app.schemas.user import UserCreate

auth_router = APIRouter()

async def get_user_by_email(db: Session, email: str):
    """Get user by email with role and permissions."""
    from sqlalchemy.orm import joinedload

    stmt = select(User).options(joinedload(User.role)).where(User.email == email)
    result = db.execute(stmt)
    return result.scalar_one_or_none()

async def get_user_permissions(db: Session, user: User):
    """Get user permissions based on role."""
    if not user.role_id:
        return []

    from sqlalchemy import text

    # Query permissions for user's role using raw SQL
    result = db.execute(text("""
        SELECT p.name
        FROM permissions p
        JOIN role_permissions rp ON p.id = rp.permission_id
        WHERE rp.role_id = :role_id
    """), {"role_id": str(user.role_id)}).fetchall()

    return [row[0] for row in result]

@auth_router.post("/register", response_model=UserResponse)
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """Register a new user."""
    # Check if user already exists
    existing_user = await get_user_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Get default role (user)
    default_role = db.execute(select(Role).where(Role.name == "user")).scalar_one_or_none()
    if not default_role:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Default role not found"
        )

    # Store role name before potential session issues
    role_name = default_role.name

    # Create new user
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        password_hash=hashed_password,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        phone=user_data.phone,
        role_id=default_role.id
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Use the input data directly to avoid SQLAlchemy session issues
    return UserResponse(
        id=new_user.id,
        email=user_data.email,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        phone=user_data.phone,
        role=role_name,
        is_active=True,  # Default value for new users
        is_verified=False,  # Default value for new users
        created_at=new_user.created_at
    )

@auth_router.post("/login", response_model=TokenResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Login user and return JWT tokens."""
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

    # Get user role and permissions
    role = None
    if user.role_id:
        from sqlalchemy import text
        result = db.execute(text("SELECT name FROM roles WHERE id = :role_id"), {"role_id": str(user.role_id)}).fetchone()
        if result:
            # Create a simple role object
            class SimpleRole:
                def __init__(self, name):
                    self.name = name
            role = SimpleRole(result[0])

    permissions = await get_user_permissions(db, user)

    # Create tokens
    token_data = {
        "sub": str(user.id),
        "email": user.email,
        "role": role.name if role else None,
        "permissions": permissions
    }

    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token({"sub": str(user.id)})

    # Update last login - skip for now due to SQLite issues
    # user.last_login = func.now()
    # db.commit()

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
            role=role.name if role else None,
            is_active=user.is_active,
            is_verified=user.is_verified,
            created_at=user.created_at
        )
    )

@auth_router.post("/refresh", response_model=dict)
async def refresh_token(refresh_token: str, db: Session = Depends(get_db)):
    """Refresh access token using refresh token."""
    try:
        payload = verify_token(refresh_token, "refresh")
        user_id = payload.get("sub")

        # Get user
        user = db.get(User, user_id)
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive"
            )

        # Get user permissions
        permissions = await get_user_permissions(db, user)

        # Create new access token
        token_data = {
            "sub": str(user.id),
            "email": user.email,
            "role": user.role.name if user.role else None,
            "permissions": permissions
        }

        access_token = create_access_token(token_data)

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": 1800
        }

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

@auth_router.post("/logout")
async def logout():
    """Logout user (client should discard tokens)."""
    return {"message": "Successfully logged out"}