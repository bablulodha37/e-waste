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
    private String email;
    private String password;

    // 🔹 NEW: Vehicle Details
    private String vehicleNumber;
    private String vehicleType; // e.g., "Van", "Truck", "Bike"

    private Double latitude;
    private Double longitude;
}