#!/usr/bin/env python3
import sqlite3

# Connect to database
conn = sqlite3.connect("test_bouncer.db")
cursor = conn.cursor()

# Check if service_profiles table exists
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='service_profiles';")
table_exists = cursor.fetchone()

if table_exists:
    print("[OK] service_profiles table exists\n")

    # Get table schema
    cursor.execute("PRAGMA table_info(service_profiles);")
    columns = cursor.fetchall()
    print("Table Schema:")
    for col in columns:
        print(f"  - {col[1]} ({col[2]})")

    # Count total profiles
    cursor.execute("SELECT COUNT(*) FROM service_profiles;")
    total = cursor.fetchone()[0]
    print(f"\n Total Profiles: {total}")

    # Count by type
    cursor.execute("SELECT profile_type, COUNT(*) FROM service_profiles GROUP BY profile_type;")
    by_type = cursor.fetchall()
    print("\nProfiles by Type:")
    for row in by_type:
        print(f"  - {row[0]}: {row[1]}")

    # Show all profiles
    cursor.execute("SELECT id, user_id, profile_type, name, group_name, location, amount_per_hour, is_active, created_at FROM service_profiles;")
    profiles = cursor.fetchall()

    if profiles:
        print("\nAll Profiles:")
        for p in profiles:
            print(f"\n  ID: {p[0]}")
            print(f"  User ID: {p[1]}")
            print(f"  Type: {p[2]}")
            print(f"  Name: {p[3]}")
            print(f"  Group Name: {p[4]}")
            print(f"  Location: {p[5]}")
            print(f"  Amount/Hour: {p[6]}")
            print(f"  Active: {p[7]}")
            print(f"  Created: {p[8]}")
    else:
        print("\n[WARNING] No profiles found in database!")
else:
    print("[ERROR] service_profiles table does NOT exist!")

conn.close()
