package com.lodha.EcoSaathi.Service;

import com.lodha.EcoSaathi.Entity.*;
import com.lodha.EcoSaathi.Repository.*;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Objects;

@Service
public class IssueService {

    private final IssueRepository issueRepository;
    private final IssueMessageRepository issueMessageRepository;
    private final UserRepository userRepository;
    private final PickupPersonRepository pickupPersonRepository;
    private final EmailService emailService;
    // ✅ NEW: Notification Service
    private final NotificationService notificationService;

    public IssueService(IssueRepository issueRepository, IssueMessageRepository issueMessageRepository,
                        UserRepository userRepository, PickupPersonRepository pickupPersonRepository,
                        EmailService emailService, NotificationService notificationService) {
        this.issueRepository = issueRepository;
        this.issueMessageRepository = issueMessageRepository;
        this.userRepository = userRepository;
        this.pickupPersonRepository = pickupPersonRepository;
        this.emailService = emailService;
        this.notificationService = notificationService;
    }

    // 🔒 Security Check Helper
    private void validateAccess(Issue issue, String role, Long requesterId) {
        if ("ADMIN".equalsIgnoreCase(role)) return;

        if ("USER".equalsIgnoreCase(role)) {
            if (issue.getUser() != null && Objects.equals(issue.getUser().getId(), requesterId)) return;
        }

        if ("PICKUP".equalsIgnoreCase(role) || "PICKUP_PERSON".equalsIgnoreCase(role)) {
            if (issue.getPickupPerson() != null && Objects.equals(issue.getPickupPerson().getId(), requesterId)) return;
        }

        throw new RuntimeException("⛔ ACCESS DENIED: You cannot view or reply to this ticket.");
    }

    // ✅ Create Issue (Updated to Send Email on Creation)
    public Issue createIssue(Long reporterId, String role, String subject, String description) {
        Issue issue = new Issue();
        issue.setSubject(subject);
        issue.setDescription(description);
        issue.setStatus("OPEN");
        issue.setLastUpdatedAt(java.time.LocalDateTime.now()); // Set initial update time

        User user = null;
        PickupPerson pickupPerson = null;

        // 1. Identify who is creating the issue
        if ("USER".equalsIgnoreCase(role)) {
            user = userRepository.findById(reporterId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            issue.setUser(user);
        } else if ("PICKUP".equalsIgnoreCase(role) || "PICKUP_PERSON".equalsIgnoreCase(role)) {
            pickupPerson = pickupPersonRepository.findById(reporterId)
                    .orElseThrow(() -> new RuntimeException("Pickup Person not found"));
            issue.setPickupPerson(pickupPerson);
        }

        // 2. Save the Issue first to get an ID
        Issue savedIssue = issueRepository.save(issue);

        // 3. Add the description as the first message
        // Note: passing description as message, role as creator
        addReply(savedIssue.getId(), role, reporterId, description);

        // ✅ 4. SEND EMAIL & NOTIFICATION TO CREATOR
        try {
            String emailTo = null;
            String name = null;

            if (user != null) {
                emailTo = user.getEmail();
                name = user.getFirstName();
            } else if (pickupPerson != null) {
                emailTo = pickupPerson.getEmail();
                name = pickupPerson.getName();
            }

            if (emailTo != null) {
                // 📧 EMAIL
                emailService.sendIssueReplyEmail(
                        emailTo,
                        name,
                        savedIssue.getId(),
                        savedIssue.getSubject(),
                        "✅ Your support ticket has been created successfully. Our team will review it and reply shortly."
                );

                // 🔔 NOTIFICATION
                if(user != null) {
                    notificationService.createNotification(user, "Support Ticket #" + savedIssue.getId() + " created successfully.", "INFO");
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to send ticket creation email: " + e.getMessage());
        }

        return savedIssue;
    }

    // ✅ FIXED: addReply Method
    public Issue addReply(Long issueId, String role, Long senderId, String messageText) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Issue not found"));

        // Validate access (allow if it's the initial description)
        if (issue.getDescription() != null && !messageText.equals(issue.getDescription())) {
            validateAccess(issue, role, senderId);
        }

        IssueMessage msg = new IssueMessage();
        msg.setIssue(issue);
        msg.setMessage(messageText);
        msg.setSenderRole(role);

        // Email variables
        String emailTo = null;
        String recipientName = "User";

        // --- LOGIC: Handle Status & Re-raising ---
        if ("ADMIN".equalsIgnoreCase(role)) {
            // Admin replies -> Status becomes ADMIN_REPLIED
            issue.setStatus("ADMIN_REPLIED");
            msg.setSenderName("EcoSaathi Support");

            // Prepare Email for User/Pickup
            if (issue.getUser() != null) {
                emailTo = issue.getUser().getEmail();
                recipientName = issue.getUser().getFirstName();
            } else if (issue.getPickupPerson() != null) {
                emailTo = issue.getPickupPerson().getEmail();
                recipientName = issue.getPickupPerson().getName();
            }

        } else {
            // User/Pickup replies -> RE-RAISE TICKET (Status becomes OPEN)
            issue.setStatus("OPEN");

            if ("USER".equalsIgnoreCase(role)) {
                if(issue.getUser() != null) msg.setSenderName(issue.getUser().getFirstName());
            } else if (issue.getPickupPerson() != null) {
                msg.setSenderName(issue.getPickupPerson().getName());
            }
        }

        // Save Message
        issueMessageRepository.save(msg);

        // Add to local list and update timestamp
        if (issue.getMessages() != null) {
            issue.getMessages().add(msg);
        }

        // ✅ IMPORTANT: Update this timestamp so Admin sees it at the top
        issue.setLastUpdatedAt(java.time.LocalDateTime.now());

        Issue savedIssue = issueRepository.save(issue);

        // Send Email only if Admin replied
        if ("ADMIN".equalsIgnoreCase(role) && emailTo != null) {
            try {
                // 📧 EMAIL
                emailService.sendIssueReplyEmail(
                        emailTo,
                        recipientName,
                        issue.getId(),
                        issue.getSubject(),
                        messageText
                );

                // 🔔 NOTIFICATION
                if(issue.getUser() != null) {
                    String preview = messageText.length() > 30 ? messageText.substring(0, 30) + "..." : messageText;
                    notificationService.createNotification(
                            issue.getUser(),
                            "New Reply on Ticket #" + issue.getId() + ": " + preview,
                            "INFO"
                    );
                }

            } catch (Exception e) {
                System.out.println("Error sending email: " + e.getMessage());
            }
        }

        return savedIssue;
    }

    public Issue getIssueById(Long issueId, Long requesterId, String role) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Issue not found"));

        validateAccess(issue, role, requesterId);

        // Load messages in proper order
        List<IssueMessage> msgs = issueMessageRepository.findByIssueIdOrderByCreatedAtAsc(issueId);
        issue.setMessages(msgs);

        return issue;
    }

    public Issue closeIssue(Long issueId, String role) {
        Issue issue = issueRepository.findById(issueId).orElseThrow();
        issue.setStatus("CLOSED");
        Issue savedIssue = issueRepository.save(issue);

        // 🔔 NOTIFICATION
        if(issue.getUser() != null) {
            notificationService.createNotification(issue.getUser(), "Ticket #" + issueId + " has been closed.", "WARNING");
        }

        return savedIssue;
    }

    public List<Issue> getAllIssues() { return issueRepository.findAll(); }
    public List<Issue> getIssuesByUser(Long uid) { return issueRepository.findByUserId(uid); }
    public List<Issue> getIssuesByPickupPerson(Long pid) { return issueRepository.findByPickupPersonId(pid); }
}