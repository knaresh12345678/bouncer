#!/usr/bin/env python3
"""
Seed script to create test users for the Bouncer App
"""
import asyncio
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.user import User, Role, Permission, RolePermission

async def create_test_users():
    """Create test users for development"""

    # Create database session
    db: Session = SessionLocal()

    try:
        # Ensure all tables exist
        Base.metadata.create_all(bind=engine)

        # Check if roles exist, create if they don't
        admin_role = db.execute(select(Role).where(Role.name == "admin")).scalar_one_or_none()
        if not admin_role:
            admin_role = Role(name="admin", description="System administrator with full access")
            db.add(admin_role)

        bouncer_role = db.execute(select(Role).where(Role.name == "bouncer")).scalar_one_or_none()
        if not bouncer_role:
            bouncer_role = Role(name="bouncer", description="Security professional providing services")
            db.add(bouncer_role)

        user_role = db.execute(select(Role).where(Role.name == "user")).scalar_one_or_none()
        if not user_role:
            user_role = Role(name="user", description="Customer booking bouncer services")
            db.add(user_role)

        db.commit()
        db.refresh(admin_role)
        db.refresh(bouncer_role)
        db.refresh(user_role)

        # Test users data
        test_users = [
            {
                "email": "admin@secureguard.com",
                "password": "admin123",
                "first_name": "Admin",
                "last_name": "User",
                "phone": "+1-555-0001",
                "role": admin_role,
                "is_verified": True
            },
            {
                "email": "bouncer@secureguard.com",
                "password": "bouncer123",
                "first_name": "John",
                "last_name": "Doe",
                "phone": "+1-555-0002",
                "role": bouncer_role,
                "is_verified": True
            },
            {
                "email": "user@secureguard.com",
                "password": "user123",
                "first_name": "Jane",
                "last_name": "Smith",
                "phone": "+1-555-0003",
                "role": user_role,
                "is_verified": True
            },
            {
                "email": "testuser@example.com",
                "password": "test123",
                "first_name": "Test",
                "last_name": "User",
                "phone": "+1-555-0004",
                "role": user_role,
                "is_verified": True
            }
        ]

        # Create test users
        created_users = []
        for user_data in test_users:
            # Check if user already exists
            existing_user = db.execute(select(User).where(User.email == user_data["email"])).scalar_one_or_none()

            if not existing_user:
                # Hash password
                hashed_password = get_password_hash(user_data["password"])

                # Create user
                new_user = User(
                    email=user_data["email"],
                    password_hash=hashed_password,
                    first_name=user_data["first_name"],
                    last_name=user_data["last_name"],
                    phone=user_data["phone"],
                    role_id=user_data["role"].id,
                    is_active=True,
                    is_verified=user_data["is_verified"]
                )

                db.add(new_user)
                created_users.append((user_data["email"], user_data["password"], user_data["role"].name))
                print(f"+ Created user: {user_data['email']} (role: {user_data['role'].name})")
            else:
                print(f"- User already exists: {user_data['email']} (role: {existing_user.role.name if existing_user.role else 'no role'})")

        # Commit all changes
        db.commit()

        if created_users:
            print(f"\nSuccessfully created {len(created_users)} test users!")
            print("\nTest Users Created:")
            print("=" * 50)
            for email, password, role in created_users:
                print(f"Email: {email}")
                print(f"Password: {password}")
                print(f"Role: {role}")
                print("-" * 30)
        else:
            print("\nTest Users (already exist):")
            print("=" * 50)
            for user_data in test_users:
                print(f"Email: {user_data['email']}")
                print(f"Password: {user_data['password']}")
                print(f"Role: {user_data['role'].name}")
                print("-" * 30)

        print("\nYou can now use these credentials to test the login functionality!")

    except Exception as e:
        print(f"Error creating test users: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("Creating test users for Bouncer App...")
    asyncio.run(create_test_users())