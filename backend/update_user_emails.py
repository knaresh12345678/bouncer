#!/usr/bin/env python3
"""
Script to update test user emails from .test to .com domains
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.user import User

def update_user_emails(db: Session):
    """Update test user emails from .test to .com domains."""

    email_updates = [
        ("admin@bouncer.test", "admin@glufer.com"),
        ("bouncer@bouncer.test", "bouncer@glufer.com"),
        ("user@bouncer.test", "user@glufer.com")
    ]

    updated_count = 0
    for old_email, new_email in email_updates:
        user = db.query(User).filter_by(email=old_email).first()
        if user:
            user.email = new_email
            print(f"Updated: {old_email} -> {new_email}")
            updated_count += 1
        else:
            print(f"User not found: {old_email}")

    db.commit()
    return updated_count

def main():
    print("Updating test user emails from .test to .com domains...")

    db = SessionLocal()
    try:
        updated = update_user_emails(db)
        print(f"\nUpdated {updated} user emails")

        # Verify the changes
        print("\nUpdated User Accounts:")
        users = db.query(User).filter(User.email.like('%@glufer.com')).all()
        for user in users:
            role_name = db.execute(
                "SELECT name FROM roles WHERE id = :role_id",
                {"role_id": str(user.role_id)}
            ).fetchone()
            role = role_name[0] if role_name else "unknown"
            print(f"  {user.email} (Role: {role})")

        print("\n✅ User emails updated successfully!")

    except Exception as e:
        print(f"Error updating user emails: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    main()