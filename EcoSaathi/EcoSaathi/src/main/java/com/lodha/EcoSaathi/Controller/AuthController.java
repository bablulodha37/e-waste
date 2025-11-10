package com.lodha.EcoSaathi.Controller;

import com.lodha.EcoSaathi.Entity.Request;
import com.lodha.EcoSaathi.Entity.User;
import com.lodha.EcoSaathi.Service.RequestService;
import com.lodha.EcoSaathi.Service.UserService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserService userService;
    private final RequestService requestService;

    public AuthController(UserService userService, RequestService requestService) {
        this.userService = userService;
        this.requestService = requestService;
    }

    // Register user
    @PostMapping("/register")
    public User register(@RequestBody User user) {
        return userService.registerUser(user);
    }

    // Login user
    @PostMapping("/login")
    public User login(@RequestBody User user) {
        return userService.login(user.getEmail(), user.getPassword());
    }

    // Update user
    @PutMapping("/user/{id}")
    public User update(@PathVariable Long id, @RequestBody User userDetails) {
        return userService.updateUser(id, userDetails);
    }

    // ✅ User stats endpoint for dashboard/certificate
    @GetMapping("/user/{id}/stats")
    public Map<String, Long> getUserStats(@PathVariable Long id) {
        return requestService.getUserStats(id);
    }

    // Upload profile picture
    @PostMapping("/user/{id}/profile-picture")
    public User uploadProfilePicture(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        return userService.updateProfilePicture(id, file);
    }

    // User submits a request with multiple photos
    @PostMapping("/user/{id}/request")
    public Request submitRequest(
            @PathVariable Long id,
            @RequestParam("type") String type,
            @RequestParam("description") String description,
            @RequestParam(value = "pickupLocation", required = false) String pickupLocation,
            @RequestParam("files") List<MultipartFile> files) {

        if (files.isEmpty() || files.size() > 5) {
            throw new RuntimeException("The request must contain between 1 and 5 photos.");
        }

        Request requestDetails = new Request();
        requestDetails.setType(type);
        requestDetails.setDescription(description);
        requestDetails.setPickupLocation(pickupLocation);

        return requestService.submitRequestWithPhotos(id, requestDetails, files);
    }

    // User requests list
    @GetMapping("/user/{id}/requests")
    public List<Request> getUserRequests(@PathVariable Long id) {
        return requestService.getRequestsByUser(id);
    }

    // Get user details
    @GetMapping("/user/{id}")
    public User getUser(@PathVariable Long id) {
        return userService.findById(id);
    }
}
