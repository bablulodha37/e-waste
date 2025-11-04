package com.lodha.EcoSaathi.Dto;

import com.lodha.EcoSaathi.Entity.User;
import lombok.Data;

@Data
public class UserDto {

    // Only include fields that should be exposed to the client
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private boolean verified;
    private String role;
    private String pickupAddress;
    private String profilePictureUrl;

    // A constructor to map from the User Entity to the DTO
    public UserDto(User user) {
        this.id = user.getId();
        this.firstName = user.getFirstName();
        this.lastName = user.getLastName();
        this.email = user.getEmail();
        this.phone = user.getPhone();
        this.verified = user.isVerified();
        this.role = user.getRole();
        this.pickupAddress = user.getPickupAddress();
        this.profilePictureUrl = user.getProfilePictureUrl();
        // Password is intentionally left out
    }
}