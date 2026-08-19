# 🛡️ CivicGuard — Community Complaint Portal
> **Full-Stack Web Security Assignment Deliverable**  
> **Track:** UN SDG Goal 16 — Strong Institutions (Civic Complaint Handling Pipeline)  
> **Core Web Security Protections:** Stored XSS Prevention (OWASP Jsoup HTML Sanitizer) & CSRF Protection (Spring Security Double-Submit Session Cookie Token).

---

## 🌐 Live Application & Direct Access Links

- **🚀 Direct Public Link (No Splash Screen / Instant Access):**  
  [https://denver-producer-queen-downtown.trycloudflare.com](https://denver-producer-queen-downtown.trycloudflare.com)
- **🏷️ Branded Custom Link:**  
  [https://civicguardsharonjoseantony.loca.lt](https://civicguardsharonjoseantony.loca.lt) *(Enter IP: `117.239.103.162` if prompted)*

🔑 **Admin Credentials:**  
- **Username:** `admin`  
- **Password:** `AdminPass123!`

## 🚀 Quick Setup & Run Instructions

### 1. Prerequisites
- **Java JDK 17** (or higher)
- **Apache Maven 3.8+**
- **Node.js v18+** & **npm**

---

### 2. Running the Backend (Spring Boot)
1. Open terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Compile and run the Spring Boot server:
   ```bash
   mvn spring-boot:run
   ```
3. The backend starts on **`http://localhost:8080`**.
   - Persistent file-based H2 Database (`./data/civicshielddb`).
   - 4 sample complaints automatically seeded on startup via `DataSeeder.java`.

---

### 3. Running the Frontend (React + Vite)
1. Open a second terminal window and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Access the web application in your browser at **`http://localhost:5173`**.

---

## 🔑 Admin Credentials
- **Username:** `admin`
- **Password:** `AdminPass123!`
- **Authentication Method:** Session-based (cookie) authentication powered by Spring Security.

---

## 🔒 Security Protections Implemented (Always Active)

### 1. STORED XSS (Cross-Site Scripting) PREVENTION
- **Backend Input Sanitization:** Before persisting any complaint to the H2 database, `ComplaintController` sanitizes all text inputs using `HtmlSanitizerUtil`. This utility leverages **Jsoup's OWASP Safelist standard** (`Safelist.basic()`) to strip out script tags, iframe elements, event handlers (`onerror`, `onload`), and `javascript:` URIs.
- **Frontend Contextual Escaping:** React renders all complaint descriptions as native JSX text strings (`<p>{complaint.description}</p>`). React automatically encodes HTML special characters into safe HTML entities prior to rendering DOM nodes. Zero `dangerouslySetInnerHTML` is used.
- **Secure File Upload Validation:** Uploaded evidence photos are validated on the backend for MIME type (`image/jpeg`, `image/jpg`, `image/png`), 2MB max file size limit, and renamed to server-side random **UUID filenames**.

### 2. CSRF (Cross-Site Request Forgery) PROTECTION
- **Double-Submit Cookie Pattern:** In `SecurityConfig.java`, Spring Security is configured with `CookieCsrfTokenRepository.withHttpOnlyFalse()`. This writes an unmasked CSRF token into an `XSRF-TOKEN` HTTP cookie.
- **Custom Axios Interceptor:** In `src/api/apiClient.js`, an Axios request interceptor intercepts all state-changing requests (`POST`, `PUT`, `DELETE`), extracts the token from the `XSRF-TOKEN` cookie, and sends it back in the custom request header `X-XSRF-TOKEN`.
- **Spring Security Enforcement:** Spring Security validates the `X-XSRF-TOKEN` header against the token bound to the request session context. Any state-changing request missing a valid matching token is immediately rejected by Spring Security with **HTTP 401 / 403 Forbidden**.

---

## 🧪 HOW TO MANUALLY TEST THE SECURITY (Screenshot Guide)

Follow these step-by-step instructions to test both security protections and capture screenshot proof for your submission:

### 📸 TEST 1 — Stored XSS Proof

1. Open your browser and navigate to **`http://localhost:5173`**.
2. Click on the **File Complaint** tab in the navigation bar.
3. Fill out the form fields:
   - **Name:** `Security Tester`
   - **Location:** `Ward 12 Main Street`
   - **Category:** `Roads`
   - **Description:** Enter the exact XSS script payload:
     ```html
     <script>alert(1)</script>
     ```
4. Click **Submit Complaint**.
   - **Observation:** Notice that the submission **succeeds** (status 201) with a green confirmation message. The application does not crash or crash the backend.
5. Navigate to the **Public Complaints** tab to view the submitted complaint.
   - **Observation:** The complaint description renders safely as plain text — **NO JavaScript alert box fires!** OWASP Jsoup Sanitizer stripped the malicious script tag server-side, and React rendered the text safely via JSX.
6. 📷 **Screenshot to Take for Proof:**  
   Take a screenshot of the **Public Complaints** page showing the submitted complaint rendered safely on screen with no alert popup.

---

### 📸 TEST 2 — CSRF Protection Proof

1. Open browser DevTools by pressing **F12** (or use Postman / cURL / Terminal).
2. Go to the **Console** or **Network** tab in DevTools.
3. Execute a state-changing `DELETE` request to the backend **WITHOUT** attaching the `X-XSRF-TOKEN` header.  
   - *Using Browser Console:* Run this code snippet:
     ```javascript
     fetch('http://localhost:8080/api/complaints/1', { method: 'DELETE' })
       .then(res => console.log('Status:', res.status));
     ```
   - *Or using Terminal / PowerShell / cURL:*
     ```bash
     curl -X DELETE http://localhost:8080/api/complaints/1
     ```
4. Observe the response returned by Spring Security.
   - **Observation:** The server immediately rejects the request and returns **`HTTP 401 Unauthorized`** or **`HTTP 403 Forbidden`**. The complaint is **NOT** deleted because the mandatory CSRF token header was missing.
5. 📷 **Screenshot to Take for Proof:**  
   Take a screenshot of the browser console or Network tab / terminal output showing the **`401 Unauthorized`** or **`403 Forbidden`** error response from the server.

---

## 📁 Project Directory Structure
```
civicshield/
├── backend/                  # Spring Boot Java Application
│   ├── src/main/java/com/civicshield/
│   │   ├── config/           # SecurityConfig, WebConfig, DataSeeder
│   │   ├── controller/       # AuthController, ComplaintController
│   │   ├── model/            # Complaint entity & DTOs
│   │   ├── repository/       # ComplaintRepository (Spring Data JPA)
│   │   ├── security/         # HtmlSanitizerUtil (Jsoup OWASP Safelist)
│   │   └── service/          # FileStorageService (File upload validation & UUID)
│   ├── src/main/resources/   # application.properties
│   └── pom.xml               # Maven configuration
│
└── frontend/                 # React + Vite Single Page Application
    ├── src/
    │   ├── api/              # apiClient.js (Axios with CSRF cookie interceptor)
    │   ├── components/       # Navbar.jsx
    │   ├── pages/            # PublicComplaintList, ComplaintForm, AdminPanel, SecurityInfoPage
    │   ├── App.jsx           # Main application shell
    │   ├── index.css         # Modern glassmorphism design system
    │   └── main.jsx          # React entry point
    └── package.json
```
