package com.lodha.EcoSaathi.Controller;

import com.lodha.EcoSaathi.Dto.UserDto;
import com.lodha.EcoSaathi.Entity.PickupPerson; // 🆕 New Import
import com.lodha.EcoSaathi.Entity.Request;
import com.lodha.EcoSaathi.Entity.User;
import com.lodha.EcoSaathi.Service.PickupPersonService; // 🆕 New Import
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
    private final RequestService requestService;
    private final PickupPersonService pickupPersonService; // 🆕 New Field

    // 🆕 Updated Constructor
    public AdminController(UserService userService, RequestService requestService, PickupPersonService pickupPersonService) {
        this.userService = userService;
        this.requestService = requestService;
        this.pickupPersonService = pickupPersonService; // Initialize
    }

    // --- USER MANAGEMENT ---

    // Returns List<UserDto> to hide passwords
    @GetMapping("/users")
    public List<UserDto> getAllUsers() {
        return userService.findAllUsersDto();
    }

    // Verify a user by Admin
    @PutMapping("/user/verify/{id}")
    public User verifyUser(@PathVariable Long id) {
        return userService.verifyUser(id);
    }

    // 🆕 New: Reject/Unverify a user by Admin
    @PutMapping("/user/reject/{id}")
    public User rejectUser(@PathVariable Long id) {
        // We will implement this new method in UserService next
        return userService.unverifyUser(id);
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

    // 🆕 New: Admin approves a PENDING request
    @PutMapping("/request/approve/{id}")
    public Request approveRequest(@PathVariable Long id) {
        // We will implement this new method in RequestService next
        return requestService.approveRequest(id);
    }

    // 🆕 New: Admin rejects a PENDING request
    @PutMapping("/request/reject/{id}")
    public Request rejectRequest(@PathVariable Long id) {
        // We will implement this new method in RequestService next
        return requestService.rejectRequest(id);
    }

    // Admin schedules an APPROVED request
    @PutMapping("/request/schedule/{id}")
    public Request scheduleRequest(@PathVariable Long id, @RequestBody ScheduleRequest scheduleDetails) {
        // We will update this method in RequestService to only schedule APPROVED requests
        return requestService.scheduleRequest(id, scheduleDetails.scheduledTime());
    }

    // 🆕 New: Admin marks a SCHEDULED request as completed
    @PutMapping("/request/complete/{id}")
    public Request completeRequest(@PathVariable Long id) {
        // We will implement this new method in RequestService next
        return requestService.completeRequest(id);
    }


    // --- PICKUP PERSON MANAGEMENT FOR ADMIN --- 🆕 New Section

    // ADD a new pickup person
    @PostMapping("/pickuppersons")
    public PickupPerson addPickupPerson(@RequestBody PickupPerson pickupPerson) {
        return pickupPersonService.addPickupPerson(pickupPerson);
    }

    // VIEW all pickup persons
    @GetMapping("/pickuppersons")
    public List<PickupPerson> getAllPickupPersons() {
        return pickupPersonService.getAllPickupPersons();
    }

    // UPDATE an existing pickup person
    @PutMapping("/pickuppersons/{id}")
    public PickupPerson updatePickupPerson(@PathVariable Long id, @RequestBody PickupPerson updatedDetails) {
        return pickupPersonService.updatePickupPerson(id, updatedDetails);
    }

    // DELETE a pickup person
    @DeleteMapping("/pickuppersons/{id}")
    public void deletePickupPerson(@PathVariable Long id) {
        pickupPersonService.deletePickupPerson(id);
    }
}