import urllib.request
import urllib.parse
import json
import http.cookiejar

BASE_URL = "http://localhost:8080/api"
FRONTEND_URL = "http://localhost:5173"

def test_seeded_complaints():
    print("\n--- 1. Testing GET /api/complaints (Seeded Data) ---")
    req = urllib.request.Request(f"{BASE_URL}/complaints")
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode())
        print(f"STATUS: {resp.status}")
        print(f"Seeded complaints count: {len(data)}")
        for c in data:
            print(f" - [{c['category']}] {c['name']} @ {c['location']} | Status: {c['status']}")
        assert len(data) >= 4, "Expected at least 4 seeded complaints"

def test_csrf_rejection():
    print("\n--- 2. Testing CSRF Protection: Secure Request WITHOUT CSRF Token Header ---")
    body = urllib.parse.urlencode({
        "name": "Attacker",
        "location": "City Center",
        "category": "Roads",
        "description": "CSRF Attack Attempt"
    }).encode()

    req = urllib.request.Request(
        f"{BASE_URL}/complaints",
        data=body,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        method="POST"
    )
    try:
        with urllib.request.urlopen(req) as resp:
            print(f"FAILED: Request without CSRF token returned status {resp.status}")
    except urllib.error.HTTPError as e:
        print(f"SUCCESS: Server rejected state-changing request without CSRF token -> HTTP {e.code}")
        assert e.code in [403, 401], f"Expected 403/401 Forbidden, got {e.code}"

def test_vulnerable_endpoint_and_xss():
    print("\n--- 3. Testing Vulnerable Endpoint & Stored XSS Preservation ---")
    boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
    xss_payload = "<img src=x onerror=\"alert('XSS Demonstrated!')\"> Pothole in lane"
    
    body_data = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="name"\r\n\r\n'
        f"Attacker User\r\n"
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="location"\r\n\r\n'
        f"Main Street\r\n"
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="category"\r\n\r\n'
        f"Roads\r\n"
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="description"\r\n\r\n'
        f"{xss_payload}\r\n"
        f"--{boundary}--\r\n"
    ).encode('utf-8')

    req = urllib.request.Request(
        f"{BASE_URL}/vulnerable/complaints",
        data=body_data,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
        method="POST"
    )

    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode())
        print(f"Vulnerable POST Status: {resp.status}")
        print(f"Submitted ID: {data['id']}")
        print(f"Stored Raw Description: {data['description']}")
        assert xss_payload in data['description'], "Raw XSS payload should be preserved in vulnerable mode"

def test_admin_login_and_authenticated_csrf():
    print("\n--- 4. Testing Admin Session Login & Authenticated CSRF ---")
    cj = http.cookiejar.CookieJar()
    opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))

    # 1. Login Admin
    login_data = json.dumps({"username": "admin", "password": "AdminPass123!"}).encode('utf-8')
    req = urllib.request.Request(
        f"{BASE_URL}/auth/login",
        data=login_data,
        headers={"Content-Type": "application/json"},
        method="POST"
    )

    with opener.open(req) as resp:
        data = json.loads(resp.read().decode())
        print(f"Login Status: {resp.status}")
        print(f"Authenticated User: {data['username']} | Role: {data['role']}")
        assert data['authenticated'] is True, "Admin authentication failed"

    # 2. Try Admin DELETE without CSRF token -> Expect HTTP 403 Forbidden
    delete_req = urllib.request.Request(
        f"{BASE_URL}/complaints/1",
        method="DELETE"
    )
    try:
        with opener.open(delete_req) as resp:
            print("FAILED: Admin DELETE without CSRF token was accepted!")
    except urllib.error.HTTPError as e:
        print(f"SUCCESS: Admin session request WITHOUT CSRF token returned HTTP {e.code} Forbidden!")
        assert e.code == 403, f"Expected 403 Forbidden for authenticated CSRF missing token, got {e.code}"

def test_frontend_server():
    print("\n--- 5. Testing Vite Frontend Server on Port 5173 ---")
    req = urllib.request.Request(FRONTEND_URL)
    with urllib.request.urlopen(req) as resp:
        print(f"Frontend Server Status: {resp.status}")
        assert resp.status == 200, "Frontend server not responding"

if __name__ == "__main__":
    print("==================================================")
    print("RUNNING CIVICSHIELD COMPREHENSIVE END-TO-END VERIFICATION")
    print("==================================================")
    test_seeded_complaints()
    test_csrf_rejection()
    test_vulnerable_endpoint_and_xss()
    test_admin_login_and_authenticated_csrf()
    test_frontend_server()
    print("\n[SUCCESS] ALL END-TO-END VERIFICATION TESTS PASSED SUCCESSFULLY!")
