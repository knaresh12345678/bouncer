#!/usr/bin/env python3
"""
Script to populate RBAC (Role-Based Access Control) data
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.core.database import engine, SessionLocal
from app.models.user import Role, Permission, RolePermission

def create_permissions(db: Session):
    """Create all necessary permissions."""
    permissions = [
        # User permissions
        {"name": "user:read", "resource": "user", "action": "read", "description": "View own profile"},
        {"name": "user:update", "resource": "user", "action": "update", "description": "Update own profile"},
        {"name": "user:delete", "resource": "user", "action": "delete", "description": "Delete own account"},

        # Booking permissions
        {"name": "booking:create", "resource": "booking", "action": "create", "description": "Create bookings"},
        {"name": "booking:read", "resource": "booking", "action": "read", "description": "View own bookings"},
        {"name": "booking:update", "resource": "booking", "action": "update", "description": "Update own bookings"},
        {"name": "booking:delete", "resource": "booking", "action": "delete", "description": "Cancel own bookings"},

        # Bouncer permissions (higher level)
        {"name": "bouncer:read", "resource": "bouncer", "action": "read", "description": "View bouncer dashboard"},
        {"name": "bouncer:manage", "resource": "bouncer", "action": "manage", "description": "Manage bookings as bouncer"},
        {"name": "booking:read_all", "resource": "booking", "action": "read_all", "description": "View all bookings"},
        {"name": "booking:update_all", "resource": "booking", "action": "update_all", "description": "Update any booking"},

        # Admin permissions
        {"name": "admin:read", "resource": "admin", "action": "read", "description": "Access admin panel"},
        {"name": "admin:manage_users", "resource": "admin", "action": "manage_users", "description": "Manage all users"},
        {"name": "admin:manage_roles", "resource": "admin", "action": "manage_roles", "description": "Manage roles and permissions"},
        {"name": "admin:system", "resource": "admin", "action": "system", "description": "System administration"},
        {"name": "user:read_all", "resource": "user", "action": "read_all", "description": "View all users"},
        {"name": "user:update_all", "resource": "user", "action": "update_all", "description": "Update any user"},
        {"name": "user:delete_all", "resource": "user", "action": "delete_all", "description": "Delete any user"},
    ]

    created_permissions = []
    for perm_data in permissions:
        existing = db.query(Permission).filter_by(name=perm_data['name']).first()
        if not existing:
            permission = Permission(**perm_data)
            db.add(permission)
            created_permissions.append(permission)
        else:
            created_permissions.append(existing)

    db.commit()
    return created_permissions

def create_roles(db: Session):
    """Create roles and assign permissions."""
    roles_data = {
        "user": [
            "user:read", "user:update", "user:delete",
            "booking:create", "booking:read", "booking:update", "booking:delete"
        ],
        "bouncer": [
            "user:read", "user:update",
            "booking:create", "booking:read", "booking:update", "booking:delete",
            "bouncer:read", "bouncer:manage", "booking:read_all", "booking:update_all"
        ],
        "admin": [
            "user:read", "user:update", "user:delete", "user:read_all", "user:update_all", "user:delete_all",
            "booking:create", "booking:read", "booking:update", "booking:delete", "booking:read_all", "booking:update_all",
            "bouncer:read", "bouncer:manage",
            "admin:read", "admin:manage_users", "admin:manage_roles", "admin:system"
        ]
    }

    created_roles = []
    for role_name, permission_names in roles_data.items():
        role = db.query(Role).filter_by(name=role_name).first()
        if not role:
            role = Role(name=role_name, description=f"{role_name.capitalize()} role")
            db.add(role)
            db.commit()
            db.refresh(role)

        created_roles.append(role)

        # Assign permissions to role
        for perm_name in permission_names:
            permission = db.query(Permission).filter_by(name=perm_name).first()
            if permission:
                existing_assignment = db.query(RolePermission).filter_by(
                    role_id=role.id, permission_id=permission.id
                ).first()

                if not existing_assignment:
                    role_permission = RolePermission(role_id=role.id, permission_id=permission.id)
                    db.add(role_permission)

        db.commit()

    return created_roles

def main():
    print("Seeding RBAC data...")

    # Create tables if they don't exist
    from app.models.user import Base
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        print("Creating permissions...")
        permissions = create_permissions(db)
        print(f"Created {len(permissions)} permissions")

        print("Creating roles and assigning permissions...")
        roles = create_roles(db)
        print(f"Created {len(roles)} roles")

        print("\nRBAC System Summary:")
        # Simple query to count roles and permissions
        total_roles = db.query(Role).count()
        total_permissions = db.query(Permission).count()
        total_assignments = db.query(RolePermission).count()
        print(f"  Total roles: {total_roles}")
        print(f"  Total permissions: {total_permissions}")
        print(f"  Total role-permission assignments: {total_assignments}")

        print("\nRBAC setup completed successfully!")

    except Exception as e:
        print(f"Error seeding RBAC data: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    main()