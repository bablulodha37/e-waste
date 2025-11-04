package com.lodha.EcoSaathi.Controller;

import com.lodha.EcoSaathi.Dto.UserDto;
import com.lodha.EcoSaathi.Entity.Request;
import com.lodha.EcoSaathi.Entity.User;
import com.lodha.EcoSaathi.Service.RequestService;
import com.lodha.EcoSaathi.Service.UserService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

// Simple DTO-like class/record for scheduling
record ScheduleRequest(LocalDateTime scheduledTime) {}

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final UserService userService;
    private final RequestService requestService; //  Inject RequestService

    public AdminController(UserService userService, RequestService requestService) {
        this.userService = userService;
        this.requestService = requestService;
    }

    //  Returns List<UserDto> to hide passwords
    @GetMapping("/users")
    public List<UserDto> getAllUsers() {
        return userService.findAllUsersDto();
    }

    //  Verify a user by Admin
    @PutMapping("/user/verify/{id}")
    public User verifyUser(@PathVariable Long id) {
        return userService.verifyUser(id);
    }

    // Admin अपनी profile को भी fetch कर सकता है
    @GetMapping("/user/{id}")
    public User getUser(@PathVariable Long id) {
        return userService.findById(id);
    }

    // --- REQUEST MANAGEMENT FOR ADMIN ---

    // Admin views all PENDING requests
    @GetMapping("/requests/pending")
    public List<Request> getPendingRequests() {
        return requestService.getAllPendingRequests();
    }

    // Admin views all requests (optional)
    @GetMapping("/requests/all")
    public List<Request> getAllRequests() {
        return requestService.getAllRequests();
    }

    // Admin schedules a request
    @PutMapping("/request/schedule/{id}")
    public Request scheduleRequest(@PathVariable Long id, @RequestBody ScheduleRequest scheduleDetails) {
        return requestService.scheduleRequest(id, scheduleDetails.scheduledTime());
    }
}