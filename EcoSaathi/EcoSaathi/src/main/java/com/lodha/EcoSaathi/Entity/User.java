package com.lodha.EcoSaathi.Entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Basic user details
    private String firstName;
    private String lastName;

    private String email;
    private String phone;
    private String password;
    private boolean verified = false;
    private String role = "USER";

    //  Pickup Address
    private String pickupAddress;

    //  Profile Picture
    private String profilePictureUrl;

    public boolean getIsAdmin() {
        return "ADMIN".equals(this.role);
    }
}