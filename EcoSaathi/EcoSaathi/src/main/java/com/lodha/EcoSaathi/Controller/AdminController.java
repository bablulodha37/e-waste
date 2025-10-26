package com.lodha.EcoSaathi.Controller;

import com.lodha.EcoSaathi.Entity.User;
import com.lodha.EcoSaathi.Service.UserService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final UserService userService;

    public AdminController(UserService userService) {
        this.userService = userService;
    }

    // ✅ All Users (Password field will be present but it's Encrypted)
    // NOTE: Production में, आपको DTO का उपयोग करना चाहिए ताकि Encrypted Password expose न हो
    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userService.findAllUsers();
    }

    // ✅ Verify a user by Admin
    @PutMapping("/user/verify/{id}")
    public User verifyUser(@PathVariable Long id) {
        return userService.verifyUser(id);
    }

    // Admin अपनी profile को भी fetch कर सकता है
    @GetMapping("/user/{id}")
    public User getUser(@PathVariable Long id) {
        return userService.findById(id);
    }
}