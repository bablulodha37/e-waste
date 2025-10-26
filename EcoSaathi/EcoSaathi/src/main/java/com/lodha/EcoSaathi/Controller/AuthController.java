package com.lodha.EcoSaathi.Controller;

import com.lodha.EcoSaathi.Entity.User;
import com.lodha.EcoSaathi.Service.UserService;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }
    @PostMapping("/register")
    public User register(@RequestBody User user) {
        return userService.registerUser(user);
    }

    @PostMapping("/login")
    public User login(@RequestBody User user) {
        return userService.login(user.getEmail(), user.getPassword());
    }

    @PutMapping("/user/{id}")
    public User update(@PathVariable Long id, @RequestBody User userDetails) {
        return userService.updateUser(id, userDetails);
    }

    @GetMapping("/user/{id}")
    public User getUser(@PathVariable Long id) {

        return userService.findById(id);
    }
}