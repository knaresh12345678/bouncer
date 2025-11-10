#!/usr/bin/env python3
"""Debug script to check user token and database"""
import sqlite3
import jwt

# JWT settings (same as simple_app.py)
SECRET_KEY = "test-secret-key-for-development-only"
ALGORITHM = "HS256"

# Get token from user input
print("Paste your token from localStorage (bouncer_access_token):")
token = input().strip()

if token:
    try:
        # Decode token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print("\n✅ Token is VALID")
        print(f"User ID from token: {payload.get('sub')}")
        print(f"Email from token: {payload.get('email')}")
        print(f"Full payload: {payload}")

        # Check if user exists in database
        user_id = payload.get('sub')
        conn = sqlite3.connect("test_bouncer.db")
        cursor = conn.cursor()

        cursor.execute("SELECT id, email, first_name, last_name, role_id FROM users WHERE id = ?", (user_id,))
        user = cursor.fetchone()

        if user:
            print(f"\n✅ User EXISTS in database:")
            print(f"   ID: {user[0]}")
            print(f"   Email: {user[1]}")
            print(f"   Name: {user[2]} {user[3]}")
            print(f"   Role ID: {user[4]}")

            # Check for user profile
            cursor.execute("SELECT * FROM user_profiles WHERE user_id = ?", (user_id,))
            profile = cursor.fetchone()
            if profile:
                print(f"✅ User profile EXISTS")
            else:
                print(f"⚠️  User profile DOES NOT EXIST (will be created as empty)")
        else:
            print(f"\n❌ User NOT FOUND in database!")
            print(f"   Token has user_id: {user_id}")
            print(f"   But this ID doesn't exist in users table")

        conn.close()

    except jwt.ExpiredSignatureError:
        print("\n❌ Token has EXPIRED")
    except jwt.InvalidTokenError as e:
        print(f"\n❌ Token is INVALID: {e}")
    except Exception as e:
        print(f"\n❌ Error: {e}")
else:
    print("No token provided")
