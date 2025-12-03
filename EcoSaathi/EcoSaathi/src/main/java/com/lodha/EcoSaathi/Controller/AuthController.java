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

    // ✅ Register user
    @PostMapping("/register")
    public User register(@RequestBody User user) {
        return userService.registerUser(user);
    }

    // ✅ Login user
    @PostMapping("/login")
    public User login(@RequestBody User user) {
        return userService.login(user.getEmail(), user.getPassword());
    }

    // ✅ Update user profile
    @PutMapping("/user/{id}")
    public User update(@PathVariable Long id, @RequestBody User userDetails) {
        return userService.updateUser(id, userDetails);
    }

    // ✅ Stats endpoint (for dashboard/certificate)
    @GetMapping("/user/{id}/stats")
    public Map<String, Long> getUserStats(@PathVariable Long id) {
        return requestService.getUserStats(id);
    }

    // ✅ Upload profile picture
    @PostMapping("/user/{id}/profile-picture")
    public User uploadProfilePicture(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        return userService.updateProfilePicture(id, file);
    }

    // ✅ Submit new e-waste pickup request (UPDATED FORM)
    @PostMapping("/user/{id}/request")
    public Request submitRequest(
            @PathVariable Long id,
            @RequestParam("type") String type,
            @RequestParam("description") String description,
            @RequestParam(value = "pickupLocation", required = false) String pickupLocation,
            @RequestParam("deviceType") String deviceType,
            @RequestParam("brandModel") String brandModel,
            @RequestParam("condition") String condition,
            @RequestParam("quantity") Integer quantity,
            @RequestParam(value = "additionalRemarks", required = false) String additionalRemarks,
            @RequestParam("files") MultipartFile[] files) {

        if (files == null || files.length == 0) {
            throw new RuntimeException("❌ At least one photo (Top Side) is required.");
        }
        if (files.length > 5) {
            throw new RuntimeException("❌ Maximum 5 photos allowed per request.");
        }

        Request requestDetails = new Request();
        requestDetails.setType(type);
        requestDetails.setDescription(description);
        requestDetails.setPickupLocation(pickupLocation);

        // 🔹 NEW FIELDS FROM FORM
        requestDetails.setDeviceType(deviceType);
        requestDetails.setBrandModel(brandModel);
        requestDetails.setCondition(condition);
        requestDetails.setQuantity(quantity);
        requestDetails.setAdditionalRemarks(additionalRemarks);

        return requestService.submitRequestWithPhotos(id, requestDetails, List.of(files));
    }

    // ✅ Fetch user's requests
    @GetMapping("/user/{id}/requests")
    public List<Request> getUserRequests(@PathVariable Long id) {
        return requestService.getRequestsByUser(id);
    }

    // ✅ Get user profile
    @GetMapping("/user/{id}")
    public User getUser(@PathVariable Long id) {
        return userService.findById(id);
    }

    // ✅ Get Single Request Details (For GPS tracking)
    @GetMapping("/request/{requestId}")
    public Request getRequestById(@PathVariable Long requestId) {
        return requestService.findById(requestId);
    }

    // 🔹 Forgot Password - Step 1: Request OTP
    @PostMapping("/forgot-password")
    public String forgotPassword(@RequestParam String email) {
        userService.forgotPassword(email);
        return "OTP sent to your email.";
    }

    // 🔹 Forgot Password - Step 2: Reset with OTP
    @PostMapping("/reset-password")
    public String resetPassword(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String otp = payload.get("otp");
        String newPassword = payload.get("newPassword");

        userService.resetPassword(email, otp, newPassword);
        return "Password reset successfully. You can now login.";
    }
}