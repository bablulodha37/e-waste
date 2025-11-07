package com.lodha.EcoSaathi.Entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List; // Import List

@Data
@Entity
@Table(name = "requests")
public class Request {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Type of Device (e.g., "laptop", "Computer")
    private String type;

    private String description;

    // The address for the pickup (can default to user's registered address)
    private String pickupLocation;

    // Status can be: PENDING, SCHEDULED, COMPLETED, CANCELLED
    private String status = "PENDING";

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime scheduledTime; // Admin sets this

    //  5 फ़ोटो के URLs को स्टोर करने के लिए
    @ElementCollection // This tells JPA to store a collection of simple types
    @CollectionTable(name = "request_photos", joinColumns = @JoinColumn(name = "request_id"))
    @Column(name = "photo_url")
    private List<String> photoUrls; // एक रिक्वेस्ट के लिए सभी फोटो URLs

    // Link the request to a specific user
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}