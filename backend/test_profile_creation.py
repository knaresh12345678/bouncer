"""
Test script to verify bouncer login and profile creation flow
"""
import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_bouncer_flow():
    print("=" * 60)
    print("Testing Bouncer Login and Profile Creation Flow")
    print("=" * 60)

    # Step 1: Login as bouncer
    print("\n[Step 1] Logging in as bouncer...")
    login_data = {
        "username": "bouncer@secureguard.com",
        "password": "password123"  # Update with actual password
    }

    try:
        login_response = requests.post(
            f"{BASE_URL}/auth/login",
            data=login_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )

        if login_response.status_code == 200:
            print("[OK] Login successful!")
            login_result = login_response.json()
            access_token = login_result.get("access_token")
            user_info = login_result.get("user", {})

            print(f"  User ID: {user_info.get('id')}")
            print(f"  Email: {user_info.get('email')}")
            print(f"  Role: {user_info.get('role')}")
            print(f"  Token (first 50 chars): {access_token[:50]}...")
        else:
            print(f"[FAIL] Login failed: {login_response.status_code}")
            print(f"  Response: {login_response.text}")
            return

    except Exception as e:
        print(f"[FAIL] Login error: {str(e)}")
        return

    # Step 2: Create a service profile
    print("\n[Step 2] Creating service profile...")
    profile_data = {
        "profile_type": "individual",
        "name": "John Security",
        "location": "New York",
        "phone_number": "+1-555-0123",
        "amount_per_hour": 50.0
    }

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    try:
        profile_response = requests.post(
            f"{BASE_URL}/service-profiles",
            json=profile_data,
            headers=headers
        )

        if profile_response.status_code == 200:
            print("[OK] Profile created successfully!")
            profile_result = profile_response.json()
            print(f"  Profile ID: {profile_result.get('profile_id')}")
            print(f"  Profile Type: {profile_result.get('profile_type')}")
            print(f"  Message: {profile_result.get('message')}")
        else:
            print(f"[FAIL] Profile creation failed: {profile_response.status_code}")
            print(f"  Response: {profile_response.text}")

    except Exception as e:
        print(f"[FAIL] Profile creation error: {str(e)}")
        return

    # Step 3: Retrieve created profiles
    print("\n[Step 3] Retrieving my profiles...")
    try:
        get_profiles_response = requests.get(
            f"{BASE_URL}/service-profiles/my-profiles",
            headers=headers
        )

        if get_profiles_response.status_code == 200:
            print("[OK] Profiles retrieved successfully!")
            profiles_result = get_profiles_response.json()
            profiles = profiles_result.get('profiles', [])
            print(f"  Total profiles: {len(profiles)}")
            for i, profile in enumerate(profiles[:3], 1):
                print(f"  Profile {i}: {profile.get('name')} - {profile.get('location')}")
        else:
            print(f"[FAIL] Get profiles failed: {get_profiles_response.status_code}")
            print(f"  Response: {get_profiles_response.text}")

    except Exception as e:
        print(f"[FAIL] Get profiles error: {str(e)}")

    print("\n" + "=" * 60)
    print("Test completed!")
    print("=" * 60)

if __name__ == "__main__":
    test_bouncer_flow()
