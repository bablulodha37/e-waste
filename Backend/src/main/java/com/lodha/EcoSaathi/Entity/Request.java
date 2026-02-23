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

    private String type;
    private String description;
    private String pickupLocation;
    private String status = "PENDING";
    private String pickupOtp;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime scheduledTime; // Admin sets this

    // 🔹 NEW FIELDS FOR REQUEST FORM
    private String deviceType;         // e.g. Laptop, Mobile, TV, Printer, etc.
    private String brandModel;         // Brand & Model text
    @Column(name = "device_condition")
    private String condition;          // Working / Damaged / Dead
    private Integer quantity;          // Quantity
    private String additionalRemarks;  // Additional remarks from user

    @ElementCollection
    @CollectionTable(name = "request_photos", joinColumns = @JoinColumn(name = "request_id"))
    @Column(name = "photo_url")
    private List<String> photoUrls;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "pickup_person_id")
    private PickupPerson assignedPickupPerson;

    private boolean isPickupPersonAssigned = false;
}
