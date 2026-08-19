package com.civicshield.security;

import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;
import org.owasp.encoder.Encode;
import org.springframework.stereotype.Component;

@Component
public class HtmlSanitizerUtil {

    /**
     * Sanitizes user-submitted rich text using Jsoup Safelist (OWASP HTML Sanitization Standard).
     * Prevents Stored XSS by stripping malicious tags (<script>, <iframe>, event handlers like onerror).
     */
    public String sanitize(String input) {
        if (input == null) {
            return "";
        }
        // Jsoup clean with basic safelist: permits <b>, <i>, <em>, <strong>, <p>, <br>
        // Removes all scripts, on* attributes, iframe, object, embed
        String sanitized = Jsoup.clean(input, Safelist.basic());
        return sanitized.trim();
    }

    /**
     * Strictly strips all HTML tags and encodes for plain text fields like name and location.
     */
    public String sanitizeStrictText(String input) {
        if (input == null) {
            return "";
        }
        // Completely remove all HTML tags
        String cleanText = Jsoup.clean(input, Safelist.none());
        return cleanText.trim();
    }
}
