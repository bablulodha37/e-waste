package com.lodha.EcoSaathi.Repository;

import com.lodha.EcoSaathi.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    // ✅ ADD THESE METHODS
    long countByVerified(boolean verified);

    // Optional: Find users by role
    // List<User> findByRole(String role);
}