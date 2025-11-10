import sqlite3

conn = sqlite3.connect('test_bouncer.db')
cursor = conn.cursor()

# Check recent profiles
cursor.execute('''
    SELECT id, name, profile_type, is_active, created_at
    FROM service_profiles
    ORDER BY created_at DESC
    LIMIT 10
''')

profiles = cursor.fetchall()
print('Recent service profiles:')
print(f'Total profiles found: {len(profiles)}\n')

for p in profiles:
    profile_id = p[0][:8] + '...' if p[0] else 'None'
    name = p[1] or 'N/A'
    profile_type = p[2] or 'N/A'
    is_active = p[3]
    created_at = p[4] or 'N/A'

    print(f'ID: {profile_id}, Name: {name}, Type: {profile_type}, Active: {is_active}, Created: {created_at}')

conn.close()
