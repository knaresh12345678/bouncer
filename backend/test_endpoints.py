#!/usr/bin/env python3
"""Test the user profile endpoints"""
import requests
import json
import sys

# Fix encoding for Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

BASE_URL = "http://localhost:8000/api"

print("=" * 60)
print("TESTING USER PROFILE ENDPOINTS")
print("=" * 60)

# Step 1: Login to get token
print("\n1. Logging in to get token...")
login_data = {
    "username": "user@secureguard.com",
    "password": "User@123",
    "user_type": "user"
}

try:
    response = requests.post(f"{BASE_URL}/auth/login", data=login_data)
    if response.status_code == 200:
        token_data = response.json()
        token = token_data.get("access_token")
        print(f"   [OK] Login successful!")
        print(f"   Token: {token[:50]}...")
        print(f"   User: {token_data.get('user', {}).get('email')}")
    else:
        print(f"   [FAIL] Login failed: {response.status_code}")
        print(f"   Response: {response.text}")
        exit(1)
except Exception as e:
    print(f"   [ERROR] Error: {e}")
    exit(1)

# Step 2: Test GET /api/user/profile
print("\n2. Testing GET /api/user/profile...")
headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

try:
    response = requests.get(f"{BASE_URL}/user/profile", headers=headers)
    print(f"   Status Code: {response.status_code}")

    if response.status_code == 200:
        profile_data = response.json()
        print(f"   [OK] Profile fetch successful!")
        print(f"   User: {profile_data.get('user', {}).get('firstName')} {profile_data.get('user', {}).get('lastName')}")
        print(f"   Email: {profile_data.get('user', {}).get('email')}")
        print(f"   Stats: {profile_data.get('stats')}")
    else:
        print(f"   [FAIL] Profile fetch failed")
        print(f"   Response: {response.text}")
except Exception as e:
    print(f"   [ERROR] Error: {e}")

# Step 3: Test GET /api/user/bookings
print("\n3. Testing GET /api/user/bookings...")
try:
    response = requests.get(f"{BASE_URL}/user/bookings", headers=headers)
    print(f"   Status Code: {response.status_code}")

    if response.status_code == 200:
        bookings_data = response.json()
        print(f"   [OK] Bookings fetch successful!")
        print(f"   Total bookings: {bookings_data.get('total', 0)}")

        if bookings_data.get('bookings'):
            print(f"   First booking: {bookings_data['bookings'][0].get('eventName')}")
    else:
        print(f"   [FAIL] Bookings fetch failed")
        print(f"   Response: {response.text}")
except Exception as e:
    print(f"   [ERROR] Error: {e}")

# Step 4: Test PUT /api/user/profile
print("\n4. Testing PUT /api/user/profile...")
update_data = {
    "first_name": "Jane",
    "last_name": "Smith",
    "phone": "9876543210",
    "bio": "Updated bio from test script",
    "location_address": "123 Test Street, Test City"
}

try:
    response = requests.put(
        f"{BASE_URL}/user/profile",
        data=update_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    print(f"   Status Code: {response.status_code}")

    if response.status_code == 200:
        print(f"   [OK] Profile update successful!")
        result = response.json()
        print(f"   Message: {result.get('message')}")
    else:
        print(f"   [FAIL] Profile update failed")
        print(f"   Response: {response.text}")
except Exception as e:
    print(f"   [ERROR] Error: {e}")

print("\n" + "=" * 60)
print("TEST COMPLETE")
print("=" * 60)
