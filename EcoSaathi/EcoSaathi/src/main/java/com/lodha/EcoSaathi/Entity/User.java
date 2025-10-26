package com.lodha.EcoSaathi.Entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String email;
    private String phone;
    private String password;
    private boolean verified = false;
    private String role = "USER";

    public boolean getIsAdmin() {
        // We check if the 'role' string is exactly "ADMIN" (case sensitive)
        return "ADMIN".equals(this.role);
    }
}
