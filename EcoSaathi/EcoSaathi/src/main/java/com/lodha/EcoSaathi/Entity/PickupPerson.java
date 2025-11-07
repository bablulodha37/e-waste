package com.lodha.EcoSaathi.Entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "pickup_persons")
public class PickupPerson {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String phone;
    // Assuming email is optional, but good for contact
    private String email;

    // You might later want a field for 'assignedArea' or 'isAvailable'
}