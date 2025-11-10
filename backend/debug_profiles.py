import sqlite3

conn = sqlite3.connect('test_bouncer.db')
cursor = conn.cursor()

print("=== Checking service_profiles ===")
cursor.execute('SELECT id, user_id, name, profile_type, is_active FROM service_profiles')
profiles = cursor.fetchall()
print(f'Total profiles: {len(profiles)}')
for p in profiles:
    print(f'  Profile ID: {p[0][:8]}..., User ID: {p[1]}, Name: {p[2]}, Type: {p[3]}, Active: {p[4]} (type: {type(p[4])})')

print("\n=== Checking users ===")
cursor.execute('SELECT id, email FROM users LIMIT 5')
users = cursor.fetchall()
print(f'Total users: {len(users)}')
for u in users:
    print(f'  User ID: {u[0]}, Email: {u[1]}')

print("\n=== Testing JOIN query ===")
cursor.execute('''
    SELECT
        sp.id, sp.user_id, sp.name, sp.is_active,
        u.id as user_table_id, u.email
    FROM service_profiles sp
    LEFT JOIN users u ON sp.user_id = u.id
    WHERE sp.is_active = 1
''')
results = cursor.fetchall()
print(f'JOIN results: {len(results)}')
for r in results:
    print(f'  Profile: {r[2]}, User ID from profile: {r[1]}, User ID from users: {r[4]}, Email: {r[5]}')

# Check if there's a type mismatch
print("\n=== Checking data types ===")
cursor.execute("SELECT typeof(user_id) FROM service_profiles LIMIT 1")
sp_type = cursor.fetchone()
print(f'service_profiles.user_id type: {sp_type[0] if sp_type else "N/A"}')

cursor.execute("SELECT typeof(id) FROM users LIMIT 1")
u_type = cursor.fetchone()
print(f'users.id type: {u_type[0] if u_type else "N/A"}')

conn.close()
