#!/usr/bin/env python3
"""Fix users with NULL IDs by assigning proper UUIDs"""
import sqlite3
import uuid
import sys
import io

# Fix encoding for Windows
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

print("=" * 70)
print("FIX NULL USER IDs")
print("=" * 70)

conn = sqlite3.connect("test_bouncer.db")
cursor = conn.cursor()

# Find users with NULL IDs
cursor.execute("SELECT email, first_name, last_name FROM users WHERE id IS NULL")
null_users = cursor.fetchall()

if not null_users:
    print("\n[OK] No users with NULL IDs found. Database is OK!")
else:
    print(f"\n[WARNING] Found {len(null_users)} users with NULL IDs:")
    for user in null_users:
        print(f"   - {user[0]} ({user[1]} {user[2]})")

    print(f"\n[ACTION] Fixing NULL user IDs...")

    for user in null_users:
        email = user[0]
        # Generate a new UUID for this user
        new_id = str(uuid.uuid4())

        try:
            # Update the user with the new ID
            cursor.execute("""
                UPDATE users
                SET id = ?
                WHERE email = ? AND id IS NULL
            """, (new_id, email))

            print(f"   [OK] Fixed: {email} -> ID: {new_id}")

        except Exception as e:
            print(f"   [ERROR] Error fixing {email}: {e}")

    # Commit changes
    conn.commit()
    print(f"\n[OK] All NULL IDs fixed!")

    # Verify fix
    cursor.execute("SELECT COUNT(*) FROM users WHERE id IS NULL")
    remaining = cursor.fetchone()[0]

    if remaining == 0:
        print(f"[OK] Verification: No NULL IDs remaining")
    else:
        print(f"[WARNING] Warning: {remaining} NULL IDs still remain")

conn.close()

print("\n" + "=" * 70)
print("DONE - You can now login again with valid tokens")
print("=" * 70)
