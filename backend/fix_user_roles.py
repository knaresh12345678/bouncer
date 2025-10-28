#!/usr/bin/env python3
"""
Script to fix user role assignments by using role names instead of UUIDs
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.user import User, Role

def fix_user_roles(db: Session):
    """Fix user role assignments."""

    # Get all roles
    roles = db.query(Role).all()
    role_map = {role.name: role for role in roles}
    print(f"Available roles: {list(role_map.keys())}")

    # Update test users
    test_users = [
        ("admin@bouncer.test", "admin"),
        ("bouncer@bouncer.test", "bouncer"),
        ("user@bouncer.test", "user")
    ]

    updated_count = 0
    for email, role_name in test_users:
        user = db.query(User).filter_by(email=email).first()
        if user and role_name in role_map:
            user.role_id = role_map[role_name].id
            print(f"Updated {email} role to {role_name}")
            updated_count += 1
        elif user:
            print(f"Role '{role_name}' not found for user {email}")
        else:
            print(f"User {email} not found")

    db.commit()
    return updated_count

def main():
    print("Fixing user role assignments...")

    db = SessionLocal()
    try:
        updated = fix_user_roles(db)
        print(f"\nUpdated {updated} user roles")

        # Verify the changes
        print("\nVerification:")
        users = db.query(User).filter(User.email.like('%@bouncer.test')).all()
        for user in users:
            role_name = db.query(Role.name).filter_by(id=user.role_id).scalar() if user.role_id else None
            print(f"  {user.email} -> {role_name}")

        print("\nUser roles fixed successfully!")

    except Exception as e:
        print(f"Error fixing user roles: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    main()