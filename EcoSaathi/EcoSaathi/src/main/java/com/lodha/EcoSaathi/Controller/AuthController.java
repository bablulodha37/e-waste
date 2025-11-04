package com.lodha.EcoSaathi.Controller;

import com.lodha.EcoSaathi.Entity.Request;
import com.lodha.EcoSaathi.Entity.User;
import com.lodha.EcoSaathi.Service.RequestService;
import com.lodha.EcoSaathi.Service.UserService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

// Simple DTO-like class/record for the OTP verification request
record OtpVerificationRequest(String email, String otp) {}

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

    // UPDATED: User is registered but NOT verified. OTP is sent.
    @PostMapping("/register")
    public User register(@RequestBody User user) {
        return userService.registerUser(user);
    }

    // Endpoint for OTP verification
    @PostMapping("/verify-otp")
    public User verifyOtp(@RequestBody OtpVerificationRequest request) {
        return userService.verifyOtp(request.email(), request.otp());
    }

    @PostMapping("/login")
    public User login(@RequestBody User user) {
        return userService.login(user.getEmail(), user.getPassword());
    }

    @PutMapping("/user/{id}")
    public User update(@PathVariable Long id, @RequestBody User userDetails) {
        return userService.updateUser(id, userDetails);
    }

    // Endpoint for profile picture upload/update
    @PostMapping("/user/{id}/profile-picture")
    public User uploadProfilePicture(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        return userService.updateProfilePicture(id, file);
    }

    // 🔄 UPDATED: User submits a request with multiple photos (using multipart/form-data)
    @PostMapping("/user/{id}/request")
    public Request submitRequest(
            @PathVariable Long id,
            // Request details are now sent as separate form-data parameters
            @RequestParam("type") String type,
            @RequestParam("description") String description,
            @RequestParam(value = "pickupLocation", required = false) String pickupLocation, // Optional address

            // Accept a List of MultipartFiles (for up to 5 photos)
            @RequestParam("files") List<MultipartFile> files) {

        // 1. Validation for photo count (maximum 5 photos)
        if (files.isEmpty() || files.size() > 5) {
            throw new RuntimeException("The request must contain between 1 and 5 photos.");
        }

        // 2. Create the Request object from the form data
        Request requestDetails = new Request();
        requestDetails.setType(type);
        requestDetails.setDescription(description);
        requestDetails.setPickupLocation(pickupLocation);

        // 3. Call the new service method (which handles file saving and request creation)
        return requestService.submitRequestWithPhotos(id, requestDetails, files);
    }

    // User views their own requests
    @GetMapping("/user/{id}/requests")
    public List<Request> getUserRequests(@PathVariable Long id) {
        return requestService.getRequestsByUser(id);
    }

    @GetMapping("/user/{id}")
    public User getUser(@PathVariable Long id) {
        return userService.findById(id);
    }
}