import subprocess, bcrypt, time

print("Waiting for MySQL container to be ready...")
for i in range(30):
    result = subprocess.run(
        ['docker', 'exec', 'erp_mysql', 'mysqladmin', 'ping', '-u', 'erp_user', '-perp_password123', '--silent'],
        capture_output=True
    )
    if result.returncode == 0:
        print("MySQL is ready!")
        break
    print(f"  Not ready yet... ({i+1}/30)")
    time.sleep(3)
else:
    print("MySQL did not start in time. Make sure docker compose up is running.")
    exit(1)

print("Importing database...")
with open('livedb.sql', 'rb') as f:
    subprocess.run(
        ['docker', 'exec', '-i', 'erp_mysql', 'mysql', '-u', 'erp_user', '-perp_password123', 'erp_database'],
        stdin=f, check=True
    )
print("Done importing.")

print("Resetting passwords...")
hashed = bcrypt.hashpw(b'admin123', bcrypt.gensalt(10)).decode()
sql = f"UPDATE users SET password='{hashed}' WHERE username IN ('admin', 'superadmin');"
subprocess.run(
    ['docker', 'exec', '-i', 'erp_mysql', 'mysql', '-u', 'erp_user', '-perp_password123', 'erp_database', '-e', sql],
    check=True
)

print("\n✅ Ready! Go to http://localhost")
print("   superadmin / admin123")
print("   admin / admin123")
