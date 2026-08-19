package com.civicshield.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path uploadPath;
    private static final List<String> ALLOWED_MIME_TYPES = Arrays.asList(
            "image/jpeg", "image/jpg", "image/png"
    );
    private static final long MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB Limit

    public FileStorageService(@Value("${app.upload.dir:./uploads}") String uploadDir) {
        this.uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.uploadPath);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage directory", e);
        }
    }

    /**
     * Securely validates and stores uploaded photo file.
     * Enforces MIME type checking, size limits, and UUID filename renaming.
     */
    public String storeFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }

        // 1. File Size Validation
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds maximum allowed limit of 2MB");
        }

        // 2. MIME Type Validation
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Invalid file type. Only JPG, JPEG, and PNG images are allowed.");
        }

        // 3. Extract Extension securely
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "");
        String fileExtension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex >= 0) {
            fileExtension = originalFilename.substring(dotIndex).toLowerCase();
        } else {
            if ("image/png".equalsIgnoreCase(contentType)) {
                fileExtension = ".png";
            } else {
                fileExtension = ".jpg";
            }
        }

        // Validate Extension strictly
        if (!Arrays.asList(".jpg", ".jpeg", ".png").contains(fileExtension)) {
            throw new IllegalArgumentException("Invalid file extension. Only .jpg, .jpeg, and .png are allowed.");
        }

        // 4. Server-side UUID Renaming (Never trust or reuse original filename)
        String newFilename = UUID.randomUUID().toString() + fileExtension;

        try {
            Path targetLocation = this.uploadPath.resolve(newFilename);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            return "/api/uploads/" + newFilename;
        } catch (IOException ex) {
            throw new RuntimeException("Failed to store file " + newFilename, ex);
        }
    }

    public Path getFilePath(String filename) {
        return this.uploadPath.resolve(filename).normalize();
    }
}
