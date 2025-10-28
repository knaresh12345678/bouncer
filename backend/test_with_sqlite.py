#!/usr/bin/env python3
"""
Create a temporary SQLite database with test users for testing login functionality
"""
import os
import sqlite3
from passlib.context import CryptContext
import uuid

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_sqlite_db():
    """Create SQLite database with test data"""
    db_path = "test_bouncer.db"

    # Remove existing database if it exists
    if os.path.exists(db_path):
        os.remove(db_path)

    # Create connection
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Create tables
    cursor.executescript("""
    -- Roles table
    CREATE TABLE roles (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Users table
    CREATE TABLE users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        phone TEXT,
        avatar_url TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        is_verified BOOLEAN DEFAULT FALSE,
        role_id TEXT REFERENCES roles(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP
    );

    -- Insert default roles
    INSERT INTO roles (id, name, description) VALUES
        ('role_admin', 'admin', 'System administrator with full access'),
        ('role_bouncer', 'bouncer', 'Security professional providing services'),
        ('role_user', 'user', 'Customer booking bouncer services');
    """)

    # Generate proper UUIDs for roles and users
    role_admin_id = str(uuid.uuid4())
    role_bouncer_id = str(uuid.uuid4())
    role_user_id = str(uuid.uuid4())

    # Update roles with proper UUIDs
    cursor.execute("DELETE FROM roles")
    cursor.executemany("INSERT INTO roles (id, name, description) VALUES (?, ?, ?)", [
        (role_admin_id, 'admin', 'System administrator with full access'),
        (role_bouncer_id, 'bouncer', 'Security professional providing services'),
        (role_user_id, 'user', 'Customer booking bouncer services')
    ])

    # Test users data with proper UUID references
    test_users = [
        {
            "id": str(uuid.uuid4()),
            "email": "admin@secureguard.com",
            "password": "admin123",
            "first_name": "Admin",
            "last_name": "User",
            "phone": "+1-555-0001",
            "role_id": role_admin_id,
            "is_verified": True
        },
        {
            "id": str(uuid.uuid4()),
            "email": "bouncer@secureguard.com",
            "password": "bouncer123",
            "first_name": "John",
            "last_name": "Doe",
            "phone": "+1-555-0002",
            "role_id": role_bouncer_id,
            "is_verified": True
        },
        {
            "id": str(uuid.uuid4()),
            "email": "user@secureguard.com",
            "password": "user123",
            "first_name": "Jane",
            "last_name": "Smith",
            "phone": "+1-555-0003",
            "role_id": role_user_id,
            "is_verified": True
        }
    ]

    # Insert test users
    for user_data in test_users:
        # Hash password
        hashed_password = pwd_context.hash(user_data["password"])

        cursor.execute("""
        INSERT INTO users (id, email, password_hash, first_name, last_name, phone, role_id, is_active, is_verified)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            user_data["id"],
            user_data["email"],
            hashed_password,
            user_data["first_name"],
            user_data["last_name"],
            user_data["phone"],
            user_data["role_id"],
            True,
            user_data["is_verified"]
        ))

    # Commit and close
    conn.commit()
    conn.close()

    print("SQLite database created successfully!")
    print("\nTest Users Created:")
    print("=" * 50)
    for user_data in test_users:
        role_name = 'admin' if user_data['role_id'] == role_admin_id else \
                   'bouncer' if user_data['role_id'] == role_bouncer_id else 'user'
        print(f"Email: {user_data['email']}")
        print(f"Password: {user_data['password']}")
        print(f"Role: {role_name}")
        print("-" * 30)

    print(f"\nDatabase created at: {os.path.abspath(db_path)}")
    return db_path

if __name__ == "__main__":
    create_sqlite_db()