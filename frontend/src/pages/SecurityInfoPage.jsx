import React from 'react';
import { ShieldCheck, Lock, Code2, AlertTriangle, Key, Layers, BookOpen } from 'lucide-react';

export default function SecurityInfoPage() {
  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <BookOpen size={32} style={{ color: 'var(--primary-emerald)' }} />
          Security Architecture & Defense Technical Documentation
        </h1>
        <p className="page-subtitle">
          Detailed plain-language assignment documentation of web security vulnerabilities and implemented defenses.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* SECTION 1: STORED XSS */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.75rem' }}>
          <h2 style={{ color: '#34d399', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={24} />
            1. Stored XSS (Cross-Site Scripting) Defense
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: '1.6' }}>
            <strong>What is Stored XSS?</strong> Stored XSS occurs when an application receives untrusted data containing malicious client-side script tags (e.g. <code>&lt;script&gt;</code> or <code>&lt;img onerror="..."&gt;</code>) and stores it permanently in a database. When subsequent victims view the page, their browser executes the injected script within their session context.
          </p>

          <h4 style={{ color: '#ffffff', marginTop: '1rem', marginBottom: '0.5rem' }}>Defenses Implemented in CivicGuard:</h4>
          <ul style={{ color: 'var(--text-main)', paddingLeft: '1.25rem', lineHeight: '1.8' }}>
            <li>
              <strong>Backend Input Sanitization:</strong> Before persisting any user complaint to H2 database, <code>ComplaintController</code> passes all text fields (name, location, category, description) through <code>HtmlSanitizerUtil</code> using the <strong>Jsoup OWASP Safelist standard</strong>. Malicious tags, event handlers, and <code>javascript:</code> attributes are stripped or escaped server-side.
            </li>
            <li>
              <strong>Frontend Escaping:</strong> In Secure Mode, React renders all user text as native JSX strings (e.g. <code>&lt;p&gt;&#123;complaint.description&#125;&lt;/p&gt;</code>). React automatically escapes HTML entities prior to rendering DOM elements.
            </li>
            <li>
              <strong>Vulnerable Demo Comparison:</strong> In <code>/vulnerable</code> demo mode, the backend skips sanitization and the frontend uses <code>dangerouslySetInnerHTML</code>, proving live script execution for presentation.
            </li>
            <li>
              <strong>Secure File Upload Validation:</strong> Uploaded image attachments are validated on the backend:
              <ul style={{ paddingLeft: '1.25rem' }}>
                <li>MIME Type strictly limited to <code>image/jpeg</code>, <code>image/jpg</code>, <code>image/png</code>.</li>
                <li>Maximum file size enforced at <code>2MB</code> limit.</li>
                <li>Every file is renamed to a random server-generated <strong>UUID filename</strong> (e.g. <code>a1b2c3d4-....png</code>) so attackers cannot execute directory traversal or override server files.</li>
              </ul>
            </li>
          </ul>
        </div>

        {/* SECTION 2: CSRF PROTECTION */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.75rem' }}>
          <h2 style={{ color: '#60a5fa', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lock size={24} />
            2. CSRF (Cross-Site Request Forgery) Protection
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: '1.6' }}>
            <strong>What is CSRF?</strong> Cross-Site Request Forgery is an attack where a malicious website causes a victim's web browser to perform an unwanted action on a trusted site where the user is currently authenticated. Because browsers automatically send session cookies on cross-site requests, the server cannot distinguish between legitimate user actions and malicious cross-site requests unless anti-CSRF tokens are enforced.
          </p>

          <h4 style={{ color: '#ffffff', marginTop: '1rem', marginBottom: '0.5rem' }}>Defenses Implemented in CivicGuard:</h4>
          <ul style={{ color: 'var(--text-main)', paddingLeft: '1.25rem', lineHeight: '1.8' }}>
            <li>
              <strong>Session-Based Cookie Authentication:</strong> Spring Security manages admin panel access via HTTP session cookies (Credentials: <code>admin</code> / <code>AdminPass123!</code>).
            </li>
            <li>
              <strong>Double-Submit Cookie Pattern (CookieCsrfTokenRepository):</strong> Spring Security is configured with <code>CookieCsrfTokenRepository.withHttpOnlyFalse()</code>. This writes an <code>XSRF-TOKEN</code> cookie readable by JavaScript.
            </li>
            <li>
              <strong>Custom Axios Interceptor:</strong> For every state-changing request (POST, PUT, DELETE) in secure mode, <code>apiClient.js</code> reads the <code>XSRF-TOKEN</code> cookie and attaches it as an HTTP header: <code>X-XSRF-TOKEN</code>.
            </li>
            <li>
              <strong>Spring Security Token Validation:</strong> Spring Security compares the token in the <code>X-XSRF-TOKEN</code> header against the token bound to the user session. Any request missing a matching token is immediately blocked with <strong>HTTP 403 Forbidden</strong>.
            </li>
            <li>
              <strong>Vulnerable Route Exclusion:</strong> Endpoints under <code>/api/vulnerable/**</code> are explicitly excluded from CSRF checks via Spring Security's <code>ignoringRequestMatchers("/api/vulnerable/**")</code> to demonstrate successful un-tokened mutations during live presentation.
            </li>
          </ul>
        </div>

        {/* SECTION 3: TECH STACK CHEAT SHEET */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.75rem' }}>
          <h2 style={{ color: '#f59e0b', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={24} />
            3. Project Tech Stack & Quick Reference
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
            <div>
              <strong style={{ color: '#ffffff' }}>Backend:</strong>
              <ul style={{ color: 'var(--text-muted)', paddingLeft: '1.2rem', marginTop: '0.4rem' }}>
                <li>Java 17 & Spring Boot 3.2.3</li>
                <li>Spring Security (Session Auth & CSRF)</li>
                <li>Spring Data JPA & H2 File Database</li>
                <li>Jsoup HTML Sanitizer & OWASP Encoder</li>
              </ul>
            </div>
            <div>
              <strong style={{ color: '#ffffff' }}>Frontend:</strong>
              <ul style={{ color: 'var(--text-muted)', paddingLeft: '1.2rem', marginTop: '0.4rem' }}>
                <li>React (Vite) & Lucide Icons</li>
                <li>Custom Glassmorphic CSS System</li>
                <li>Axios with CSRF Cookie Interceptor</li>
                <li>Dual Secure vs Vulnerable Routing</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
