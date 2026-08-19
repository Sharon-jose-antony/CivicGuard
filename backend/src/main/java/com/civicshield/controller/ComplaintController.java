package com.civicshield.controller;

import com.civicshield.model.Complaint;
import com.civicshield.model.StatusUpdateRequest;
import com.civicshield.repository.ComplaintRepository;
import com.civicshield.security.HtmlSanitizerUtil;
import com.civicshield.service.FileStorageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    private final ComplaintRepository complaintRepository;
    private final HtmlSanitizerUtil htmlSanitizerUtil;
    private final FileStorageService fileStorageService;

    public ComplaintController(ComplaintRepository complaintRepository,
                               HtmlSanitizerUtil htmlSanitizerUtil,
                               FileStorageService fileStorageService) {
        this.complaintRepository = complaintRepository;
        this.htmlSanitizerUtil = htmlSanitizerUtil;
        this.fileStorageService = fileStorageService;
    }

    /**
     * Public GET endpoint: Fetches all complaints sorted by date.
     */
    @GetMapping
    public List<Complaint> getAllComplaints(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status) {
        
        List<Complaint> list = complaintRepository.findAllByOrderByCreatedAtDesc();

        if (category != null && !category.trim().isEmpty() && !"ALL".equalsIgnoreCase(category)) {
            list = list.stream()
                    .filter(c -> category.equalsIgnoreCase(c.getCategory()))
                    .collect(Collectors.toList());
        }

        if (status != null && !status.trim().isEmpty() && !"ALL".equalsIgnoreCase(status)) {
            list = list.stream()
                    .filter(c -> status.equalsIgnoreCase(c.getStatus()))
                    .collect(Collectors.toList());
        }

        return list;
    }

    /**
     * Public POST endpoint: Submits complaint with Stored XSS sanitization and CSRF enforcement.
     */
    @PostMapping
    public ResponseEntity<?> createComplaint(
            @RequestParam("name") String name,
            @RequestParam("location") String location,
            @RequestParam("category") String category,
            @RequestParam("description") String description,
            @RequestParam(value = "photo", required = false) MultipartFile photo) {

        try {
            // 1. Backend Input Sanitization using OWASP Jsoup HTML Sanitizer
            String sanitizedName = htmlSanitizerUtil.sanitizeStrictText(name);
            String sanitizedLocation = htmlSanitizerUtil.sanitizeStrictText(location);
            String sanitizedCategory = htmlSanitizerUtil.sanitizeStrictText(category);
            String sanitizedDescription = htmlSanitizerUtil.sanitize(description);

            // 2. File Upload Validation & UUID Renaming
            String photoUrl = null;
            if (photo != null && !photo.isEmpty()) {
                photoUrl = fileStorageService.storeFile(photo);
            }

            Complaint complaint = new Complaint(
                    sanitizedName,
                    sanitizedLocation,
                    sanitizedCategory,
                    sanitizedDescription,
                    photoUrl,
                    "PENDING"
            );

            Complaint saved = complaintRepository.save(complaint);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);

        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error creating complaint: " + ex.getMessage()));
        }
    }

    /**
     * Admin PUT endpoint: Updates status of a complaint. (Requires Admin session + CSRF token).
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody StatusUpdateRequest request) {
        return complaintRepository.findById(id).map(complaint -> {
            String newStatus = request.getStatus();
            if (newStatus == null || !List.of("PENDING", "IN_PROGRESS", "RESOLVED").contains(newStatus.toUpperCase())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid status value"));
            }
            complaint.setStatus(newStatus.toUpperCase());
            Complaint updated = complaintRepository.save(complaint);
            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }

    /**
     * Admin DELETE endpoint: Deletes a complaint. (Requires Admin session + CSRF token).
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteComplaint(@PathVariable Long id) {
        return complaintRepository.findById(id).map(complaint -> {
            complaintRepository.delete(complaint);
            return ResponseEntity.ok(Map.of("message", "Complaint deleted successfully", "id", id));
        }).orElse(ResponseEntity.notFound().build());
    }

    /**
     * Reset Endpoint: Clears all test complaints and resets database to clean 4 initial seeded complaints.
     */
    @PostMapping("/reset")
    public ResponseEntity<?> resetDatabase() {
        complaintRepository.deleteAll();

        Complaint c1 = new Complaint(
                "Sarah Jenkins",
                "Main St & 5th Avenue",
                "Roads",
                "Hazardous deep pothole in the middle lane causing vehicle damage and sudden braking risks.",
                null,
                "PENDING"
        );

        Complaint c2 = new Complaint(
                "Michael Chen",
                "Central Park West, Gate 3",
                "Water",
                "Clean water pipe rupture causing continuous flooding on pedestrian walkway since early morning.",
                null,
                "IN_PROGRESS"
        );

        Complaint c3 = new Complaint(
                "Elena Rostova",
                "Elm Street Block 4",
                "Streetlights",
                "Multiple streetlight poles are completely dark, creating safety concerns for evening commuters.",
                null,
                "RESOLVED"
        );

        Complaint c4 = new Complaint(
                "David Miller",
                "Market Square Plaza",
                "Sanitation",
                "Overflowing commercial waste container attracting pests near food stalls. Requires urgent clearing.",
                null,
                "PENDING"
        );

        complaintRepository.save(c1);
        complaintRepository.save(c2);
        complaintRepository.save(c3);
        complaintRepository.save(c4);

        return ResponseEntity.ok(Map.of("message", "Database successfully reset to clean sample complaints."));
    }
}
