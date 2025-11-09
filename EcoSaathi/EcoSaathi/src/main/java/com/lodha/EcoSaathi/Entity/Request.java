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

    // Status can be: PENDING, APPROVED, SCHEDULED, COMPLETED, REJECTED
    private String status = "PENDING";

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime scheduledTime; // Admin sets this

    //  5 फ़ोटो के URLs को स्टोर करने के लिए
    @ElementCollection
    @CollectionTable(name = "request_photos", joinColumns = @JoinColumn(name = "request_id"))
    @Column(name = "photo_url")
    private List<String> photoUrls;

    // Link the request to a specific user
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // 🔄 FIX: Added FetchType.EAGER to ensure the PickupPerson data is loaded
    //         immediately, so it appears in the user's request history JSON response.
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "pickup_person_id")
    private PickupPerson assignedPickupPerson;

    // 🆕 New: Field to clearly indicate if a person has been assigned
    private boolean isPickupPersonAssigned = false;
}