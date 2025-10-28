#!/usr/bin/env python3
"""
Script to create test users with different roles for RBAC testing
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.core.database import engine, SessionLocal
from app.core.security import get_password_hash
from app.models.user import User, Role

def create_test_users(db: Session):
    """Create test users for each role."""

    test_users = [
        {
            "email": "admin@bouncer.test",
            "password": "admin123",
            "first_name": "Admin",
            "last_name": "User",
            "role_name": "admin"
        },
        {
            "email": "bouncer@bouncer.test",
            "password": "bouncer123",
            "first_name": "Bouncer",
            "last_name": "Pro",
            "role_name": "bouncer"
        },
        {
            "email": "user@bouncer.test",
            "password": "user123",
            "first_name": "Regular",
            "last_name": "User",
            "role_name": "user"
        }
    ]

    created_users = []

    for user_data in test_users:
        # Check if user already exists
        existing_user = db.query(User).filter_by(email=user_data["email"]).first()
        if existing_user:
            print(f"User {user_data['email']} already exists, skipping...")
            continue

        # Get role
        role = db.query(Role).filter_by(name=user_data["role_name"]).first()
        if not role:
            print(f"Role {user_data['role_name']} not found, skipping user {user_data['email']}")
            continue

        # Create user
        hashed_password = get_password_hash(user_data["password"])
        new_user = User(
            email=user_data["email"],
            password_hash=hashed_password,
            first_name=user_data["first_name"],
            last_name=user_data["last_name"],
            role_id=role.id,
            is_active=True,
            is_verified=True
        )

        db.add(new_user)
        created_users.append(new_user)
        print(f"Created {user_data['role_name']} user: {user_data['email']}")

    db.commit()

    # Refresh all users to get their IDs
    for user in created_users:
        db.refresh(user)

    return created_users

def main():
    print("Creating test users for RBAC testing...")

    db = SessionLocal()
    try:
        users = create_test_users(db)
        print(f"\nCreated {len(users)} test users")

        print("\nTest User Credentials:")
        print("=" * 50)
        for user in users:
            role_name = user.role.name if user.role else "unknown"
            print(f"Role: {role_name.upper()}")
            print(f"Email: {user.email}")
            print(f"Password: {'admin123' if role_name == 'admin' else 'bouncer123' if role_name == 'bouncer' else 'user123'}")
            print("-" * 30)

        print("\nTest users created successfully!")

    except Exception as e:
        print(f"Error creating test users: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    main()