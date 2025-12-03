package com.lodha.EcoSaathi.Controller;

import com.lodha.EcoSaathi.Dto.ReplyRequest; // Import DTO
import com.lodha.EcoSaathi.Entity.Issue;
import com.lodha.EcoSaathi.Service.IssueService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/issues")
@CrossOrigin(origins = "http://localhost:3000") // Allow React Frontend
public class IssueController {

    private final IssueService issueService;

    public IssueController(IssueService issueService) {
        this.issueService = issueService;
    }

    // 1. Create Issue for User
    @PostMapping("/create/user/{userId}")
    public Issue createIssueUser(@PathVariable Long userId, @RequestBody Map<String, String> payload) {
        return issueService.createIssue(userId, "USER", payload.get("subject"), payload.get("description"));
    }

    // 2. Create Issue for Pickup Person
    @PostMapping("/create/pickup/{pickupId}")
    public Issue createIssuePickup(@PathVariable Long pickupId, @RequestBody Map<String, String> payload) {
        return issueService.createIssue(pickupId, "PICKUP", payload.get("subject"), payload.get("description"));
    }

    // 3. Get All Issues (For Admin)
    @GetMapping("/all")
    public List<Issue> getAllIssues() {
        // Debugging log backend console me dikhega
        System.out.println("Fetching all issues for Admin...");
        return issueService.getAllIssues();
    }

    // 4. Get User Issues
    @GetMapping("/user/{userId}")
    public List<Issue> getUserIssues(@PathVariable Long userId) {
        return issueService.getIssuesByUser(userId);
    }

    // 5. Get Single Ticket Details (Chat)
    @GetMapping("/{issueId}")
    public Issue getIssueDetails(
            @PathVariable Long issueId,
            @RequestParam Long requesterId,
            @RequestParam String role) {
        return issueService.getIssueById(issueId, requesterId, role);
    }

    // 6. Reply to Ticket (Uses DTO now)
    @PostMapping("/{issueId}/reply")
    public Issue reply(@PathVariable Long issueId, @RequestBody ReplyRequest payload) {
        return issueService.addReply(issueId, payload.getRole(), payload.getSenderId(), payload.getMessage());
    }

    // 7. Close Ticket
    @PutMapping("/{issueId}/close")
    public void closeTicket(@PathVariable Long issueId) {
        issueService.closeIssue(issueId, "ADMIN");
    }
}