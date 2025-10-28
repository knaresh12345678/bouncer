#!/usr/bin/env python3
"""
Check all users in the database
"""
import sqlite3

def check_all_users():
    """Check all users in database"""
    db_path = "test_bouncer.db"

    # Connect to database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Get all users with roles
    cursor.execute("""
        SELECT users.email, users.first_name, users.last_name,
               users.is_active, roles.name as role_name
        FROM users
        JOIN roles ON users.role_id = roles.id
        ORDER BY roles.name, users.email
    """)

    results = cursor.fetchall()
    conn.close()

    if results:
        print("=" * 60)
        print("CURRENT USERS IN DATABASE:")
        print("=" * 60)

        for email, first_name, last_name, is_active, role_name in results:
            status = "Active" if is_active else "Inactive"
            print(f"Email: {email}")
            print(f"Name: {first_name} {last_name}")
            print(f"Role: {role_name}")
            print(f"Status: {status}")
            print("-" * 40)
    else:
        print("No users found in database")

if __name__ == "__main__":
    check_all_users()