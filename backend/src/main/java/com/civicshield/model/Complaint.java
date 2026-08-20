package com.civicshield.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "complaints")
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String location;

    @Column(nullable = false)
    private String category; // Roads, Water, Streetlights, Sanitation

    @Column(nullable = false, length = 4000)
    private String description;

    private String photoUrl;

    private String audioUrl;

    @Column(nullable = false)
    private String status; // PENDING, IN_PROGRESS, RESOLVED

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public Complaint() {
        this.createdAt = LocalDateTime.now();
        this.status = "PENDING";
    }

    public Complaint(String name, String location, String category, String description, String photoUrl, String status) {
        this.name = name;
        this.location = location;
        this.category = category;
        this.description = description;
        this.photoUrl = photoUrl;
        this.audioUrl = null;
        this.status = status != null ? status : "PENDING";
        this.createdAt = LocalDateTime.now();
    }

    public Complaint(String name, String location, String category, String description, String photoUrl, String audioUrl, String status) {
        this.name = name;
        this.location = location;
        this.category = category;
        this.description = description;
        this.photoUrl = photoUrl;
        this.audioUrl = audioUrl;
        this.status = status != null ? status : "PENDING";
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPhotoUrl() {
        return photoUrl;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }

    public String getAudioUrl() {
        return audioUrl;
    }

    public void setAudioUrl(String audioUrl) {
        this.audioUrl = audioUrl;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
