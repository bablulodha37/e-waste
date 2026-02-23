package com.lodha.EcoSaathi.Entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "issues")
public class Issue {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String subject;

    @Column(length = 1000)
    private String description;

    private String status = "OPEN";

    private LocalDateTime createdAt = LocalDateTime.now();

    // ✅ ADD THIS FIELD TO FIX THE ERROR
    private LocalDateTime lastUpdatedAt = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "pickup_person_id")
    private PickupPerson pickupPerson;

    @OneToMany(mappedBy = "issue", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<IssueMessage> messages = new ArrayList<>();
}