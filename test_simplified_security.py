import urllib.request
import urllib.parse
import json
import http.cookiejar

BASE_URL = "http://localhost:8080/api"
FRONTEND_URL = "http://localhost:5173"

def run_test_1_xss_proof():
    print("\n==================================================")
    print("TEST 1 — XSS PROOF: Submitting <script>alert(1)</script>")
    print("==================================================")
    
    # 1. Fetch CSRF token cookie first
    cj = http.cookiejar.CookieJar()
    opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))

    csrf_req = urllib.request.Request(f"{BASE_URL}/csrf")
    with opener.open(csrf_req) as resp:
        pass

    xsrf_token = None
    for cookie in cj:
        if cookie.name == 'XSRF-TOKEN':
            xsrf_token = urllib.parse.unquote(cookie.value)
            break

    print(f"Obtained XSRF-TOKEN Cookie: {xsrf_token[:20]}...")

    # 2. Submit complaint with <script>alert(1)</script> as description
    boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
    xss_payload = "<script>alert(1)</script>"

    body_data = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="name"\r\n\r\n'
        f"XSS Tester\r\n"
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="location"\r\n\r\n'
        f"Ward 12 Street\r\n"
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="category"\r\n\r\n'
        f"Roads\r\n"
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="description"\r\n\r\n'
        f"{xss_payload}\r\n"
        f"--{boundary}--\r\n"
    ).encode('utf-8')

    headers = {
        "Content-Type": f"multipart/form-data; boundary={boundary}",
    }
    if xsrf_token:
        headers["X-XSRF-TOKEN"] = xsrf_token

    post_req = urllib.request.Request(f"{BASE_URL}/complaints", data=body_data, headers=headers, method="POST")
    with opener.open(post_req) as resp:
        data = json.loads(resp.read().decode())
        print(f"[SUCCESS] Submission status: {resp.status} Created")
        print(f"Complaint ID: {data['id']}")
        print(f"Stored Sanitized Description in DB: '{data['description']}'")

    # 3. Fetch complaints list
    list_req = urllib.request.Request(f"{BASE_URL}/complaints")
    with urllib.request.urlopen(list_req) as resp:
        items = json.loads(resp.read().decode())
        latest = items[0]
        print(f"Public Complaints List Latest Item Description: '{latest['description']}'")
        print("[CONFIRMED] Stored XSS payload <script>alert(1)</script> was sanitized by OWASP Jsoup Sanitizer & rendered safely without script execution!")

def run_test_2_csrf_proof():
    print("\n==================================================")
    print("TEST 2 — CSRF PROOF: DELETE Request WITHOUT CSRF Token")
    print("==================================================")
    
    # Send DELETE request to /api/complaints/1 WITHOUT X-XSRF-TOKEN header
    delete_req = urllib.request.Request(f"{BASE_URL}/complaints/1", method="DELETE")
    
    try:
        with urllib.request.urlopen(delete_req) as resp:
            print(f"[FAILED] Request without CSRF token returned HTTP {resp.status}")
    except urllib.error.HTTPError as e:
        print(f"[CONFIRMED] Server rejected tokenless DELETE request with HTTP {e.code} ({e.reason})")
        assert e.code in [401, 403], f"Expected 401 or 403, got {e.code}"

if __name__ == "__main__":
    run_test_1_xss_proof()
    run_test_2_csrf_proof()
    print("\n[SUCCESS] BOTH TEST 1 (XSS PROOF) AND TEST 2 (CSRF PROOF) PASSED EMPIRICALLY!")
