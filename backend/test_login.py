#!/usr/bin/env python3
"""
Test login directly with the database
"""
import sqlite3
from passlib.context import CryptContext

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def test_login():
    """Test login directly"""
    db_path = "test_bouncer.db"

    # Connect to database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Test credentials
    email = "admin@secureguard.com"
    password = "admin123"

    # Get user from database
    cursor.execute("""
        SELECT users.id, users.email, users.password_hash, users.first_name,
               users.last_name, users.is_active, roles.name as role_name
        FROM users
        JOIN roles ON users.role_id = roles.id
        WHERE users.email = ?
    """, (email,))

    result = cursor.fetchone()

    if result:
        user_id, user_email, password_hash, first_name, last_name, is_active, role_name = result

        print(f"Found user: {first_name} {last_name} ({user_email})")
        print(f"Role: {role_name}")
        print(f"Active: {is_active}")
        print(f"Password hash: {password_hash[:50]}...")

        # Verify password
        try:
            password_valid = pwd_context.verify(password, password_hash)
            print(f"Password valid: {password_valid}")

            if password_valid and is_active:
                print("✅ LOGIN SUCCESSFUL!")
                return True
            else:
                print("❌ LOGIN FAILED - Invalid password or inactive account")
                return False

        except Exception as e:
            print(f"❌ Password verification error: {e}")
            return False
    else:
        print("❌ User not found")
        return False

    conn.close()

if __name__ == "__main__":
    print("Testing login credentials...")
    test_login()