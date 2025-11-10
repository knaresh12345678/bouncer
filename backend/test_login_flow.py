#!/usr/bin/env python3
"""Test complete login flow to debug token issue"""
import requests
import jwt
import json

BASE_URL = "http://localhost:8000/api"
SECRET_KEY = "test-secret-key-for-development-only"
ALGORITHM = "HS256"

print("=" * 70)
print("COMPLETE LOGIN FLOW TEST")
print("=" * 70)

# Test with the actual user that exists
TEST_EMAIL = "naresh@gmail.com"
TEST_PASSWORD = input(f"\nEnter password for {TEST_EMAIL}: ").strip()

# Step 1: Login
print(f"\n[1] Attempting login with: {TEST_EMAIL}")
login_response = requests.post(
    f"{BASE_URL}/auth/login",
    data={
        "username": TEST_EMAIL,
        "password": TEST_PASSWORD
    }
)

print(f"    Status: {login_response.status_code}")

if login_response.status_code == 200:
    token_data = login_response.json()
    token = token_data.get("access_token")

    print(f"    [OK] Login successful!")
    print(f"\n[2] Token Analysis:")
    print(f"    Token (first 50 chars): {token[:50]}...")

    # Decode token
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print(f"\n[3] Token Payload:")
        print(f"    sub (user_id): {payload.get('sub')}")
        print(f"    email: {payload.get('email')}")
        print(f"    role: {payload.get('role')}")
        print(f"    exp: {payload.get('exp')}")

        if payload.get('sub') is None or payload.get('sub') == 'None':
            print(f"\n    [ERROR] Token has NULL user_id! This is the problem!")
        else:
            print(f"\n    [OK] Token has valid user_id")

        # Step 4: Test profile endpoint
        print(f"\n[4] Testing GET /api/user/profile with token...")
        profile_response = requests.get(
            f"{BASE_URL}/user/profile",
            headers={"Authorization": f"Bearer {token}"}
        )

        print(f"    Status: {profile_response.status_code}")

        if profile_response.status_code == 200:
            profile = profile_response.json()
            print(f"    [OK] Profile fetched successfully!")
            print(f"    User: {profile.get('user', {}).get('firstName')} {profile.get('user', {}).get('lastName')}")
            print(f"    Email: {profile.get('user', {}).get('email')}")
        else:
            print(f"    [FAIL] Profile fetch failed")
            print(f"    Response: {profile_response.text}")

    except jwt.ExpiredSignatureError:
        print(f"    [ERROR] Token is EXPIRED")
    except jwt.InvalidTokenError as e:
        print(f"    [ERROR] Token is INVALID: {e}")
    except Exception as e:
        print(f"    [ERROR] Unexpected error: {e}")

else:
    print(f"    [FAIL] Login failed")
    print(f"    Response: {login_response.text}")

print("\n" + "=" * 70)
