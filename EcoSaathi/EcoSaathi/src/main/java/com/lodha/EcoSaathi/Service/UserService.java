package com.lodha.EcoSaathi.Service;

import com.lodha.EcoSaathi.Entity.User;
import com.lodha.EcoSaathi.Repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User registerUser(User user) {
        // ... existing registerUser method ...
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        // ✅ NEW: Newly registered users will have the default "USER" role
        user.setRole("USER");
        return userRepository.save(user);
    }

    public User login(String email, String password) {
        // ... existing login method ...
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }
        return user;
    }

    // ✅ NEW: Admin can verify a user
    public User verifyUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        user.setVerified(true);
        return userRepository.save(user);
    }

    public User updateUser(Long userId, User updatedUserDetails) {
        // ... existing updateUser method ...
        User existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Email update
        if (updatedUserDetails.getEmail() != null && !updatedUserDetails.getEmail().isEmpty()) {
            existingUser.setEmail(updatedUserDetails.getEmail());
        }

        if (updatedUserDetails.getPhone() != null && !updatedUserDetails.getPhone().isEmpty()) {
            existingUser.setPhone(updatedUserDetails.getPhone());
        }
        if (updatedUserDetails.getPassword() != null && !updatedUserDetails.getPassword().isEmpty()) {
            existingUser.setPassword(passwordEncoder.encode(updatedUserDetails.getPassword()));
        }

        // Role update ka logic Admin APIs mein hona chahiye, not here

        return userRepository.save(existingUser);
    }

    public User findById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
    }

    // ✅ NEW: Admin method to get all users
    public List<User> findAllUsers() {
        return userRepository.findAll();
    }
}