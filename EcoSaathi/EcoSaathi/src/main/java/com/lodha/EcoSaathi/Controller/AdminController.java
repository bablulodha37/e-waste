package com.lodha.EcoSaathi.Controller;

import com.lodha.EcoSaathi.Dto.UserDto;
import com.lodha.EcoSaathi.Entity.PickupPerson;
import com.lodha.EcoSaathi.Entity.Request;
import com.lodha.EcoSaathi.Entity.User;
import com.lodha.EcoSaathi.Service.PickupPersonService;
import com.lodha.EcoSaathi.Service.RequestService;
import com.lodha.EcoSaathi.Entity.Issue;
import com.lodha.EcoSaathi.Service.IssueService;
import com.lodha.EcoSaathi.Service.UserService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

//  DTO-like class/record for scheduling
record ScheduleRequest(LocalDateTime scheduledTime, Long pickupPersonId) {}

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final UserService userService;
    private final RequestService requestService;
    private final PickupPersonService pickupPersonService;
    private final IssueService issueService;

    public AdminController(UserService userService, RequestService requestService, PickupPersonService pickupPersonService , IssueService issueService) {
        this.userService = userService;
        this.requestService = requestService;
        this.pickupPersonService = pickupPersonService;
        this.issueService = issueService;
    }

    // --- ISSUE MANAGEMENT ---

    @GetMapping("/all")
    public List<Issue> getAllIssues() {
        return issueService.getAllIssues();
    }


    @PutMapping("/issue/reply/{id}")
    public Issue replyToIssue(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String reply = payload.get("reply");

        // ✅ FIXED: Calls the new 'addReply' method
        // Role is "ADMIN", Sender ID is 0 (Admin ID placeholder)
        return issueService.addReply(id, "ADMIN", 0L, reply);
    }

    // --- USER MANAGEMENT ---

    @GetMapping("/users")
    public List<UserDto> getAllUsers() {
        return userService.findAllUsersDto();
    }

    @PutMapping("/user/verify/{id}")
    public User verifyUser(@PathVariable Long id) {
        return userService.verifyUser(id);
    }

    @PutMapping("/user/reject/{id}")
    public User rejectUser(@PathVariable Long id) {
        return userService.unverifyUser(id);
    }

    @GetMapping("/user/{id}")
    public User getUser(@PathVariable Long id) {
        return userService.findById(id);
    }

    // --- REQUEST MANAGEMENT FOR ADMIN ---

    @GetMapping("/requests/pending")
    public List<Request> getPendingRequests() {
        return requestService.getAllPendingRequests();
    }

    @GetMapping("/requests/all")
    public List<Request> getAllRequests() {
        return requestService.getAllRequests();
    }

    @PutMapping("/request/approve/{id}")
    public Request approveRequest(@PathVariable Long id) {
        return requestService.approveRequest(id);
    }

    @PutMapping("/request/reject/{id}")
    public Request rejectRequest(@PathVariable Long id) {
        return requestService.rejectRequest(id);
    }

    @PutMapping("/request/schedule/{id}")
    public Request scheduleRequest(@PathVariable Long id, @RequestBody ScheduleRequest scheduleDetails) {
        return requestService.scheduleRequest(
                id,
                scheduleDetails.scheduledTime(),
                scheduleDetails.pickupPersonId()
        );
    }

    @PutMapping("/request/complete/{id}")
    public Request completeRequest(@PathVariable Long id) {
        return requestService.completeRequest(id);
    }


    // --- PICKUP PERSON MANAGEMENT FOR ADMIN ---

    @PostMapping("/pickuppersons")
    public PickupPerson addPickupPerson(@RequestBody PickupPerson pickupPerson) {
        return pickupPersonService.addPickupPerson(pickupPerson);
    }

    @GetMapping("/pickuppersons")
    public List<PickupPerson> getAllPickupPersons() {
        return pickupPersonService.getAllPickupPersons();
    }

    @PutMapping("/pickuppersons/{id}")
    public PickupPerson updatePickupPerson(@PathVariable Long id, @RequestBody PickupPerson updatedDetails) {
        return pickupPersonService.updatePickupPerson(id, updatedDetails);
    }

    @DeleteMapping("/pickuppersons/{id}")
    public void deletePickupPerson(@PathVariable Long id) {
        pickupPersonService.deletePickupPerson(id);
    }
}