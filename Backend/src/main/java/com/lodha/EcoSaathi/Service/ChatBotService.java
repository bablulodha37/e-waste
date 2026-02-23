package com.lodha.EcoSaathi.Service;

import com.lodha.EcoSaathi.Entity.Request;
import com.lodha.EcoSaathi.Entity.User;
import org.springframework.stereotype.Service;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ChatBotService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final UserService userService;
    private final RequestService requestService;

    public ChatBotService(UserService userService, RequestService requestService) {
        this.userService = userService;
        this.requestService = requestService;
    }

    public String getResponse(String message,
                              String currentPage,
                              String role,
                              Long userId,
                              Long pickupPersonId) {

        // 🔹 DYNAMIC CONTEXT BUILD
        StringBuilder contextBuilder = new StringBuilder();
        contextBuilder.append("Current page: ").append(currentPage).append("\n");
        contextBuilder.append("Current role: ").append(role).append("\n");

        if ("ADMIN".equalsIgnoreCase(role)) {
            long totalUsers = userService.countAllUsers();
            Map<String, Long> stats = requestService.getAdminStats();

            contextBuilder.append("Admin dashboard data:\n");
            contextBuilder.append("- Total users: ").append(totalUsers).append("\n");
            contextBuilder.append("- Total requests: ").append(stats.getOrDefault("totalRequests", 0L)).append("\n");
            contextBuilder.append("- Pending requests: ").append(stats.getOrDefault("pendingRequests", 0L)).append("\n");
            contextBuilder.append("- Approved requests: ").append(stats.getOrDefault("approvedRequests", 0L)).append("\n");
            contextBuilder.append("- Scheduled requests: ").append(stats.getOrDefault("scheduledRequests", 0L)).append("\n");
            contextBuilder.append("- Completed requests: ").append(stats.getOrDefault("completedRequests", 0L)).append("\n");
            contextBuilder.append("- Rejected requests: ").append(stats.getOrDefault("rejectedRequests", 0L)).append("\n");
        }

        if ("USER".equalsIgnoreCase(role) && userId != null) {
            User user = userService.findById(userId);
            Map<String, Long> userStats = requestService.getUserStats(userId);
            List<Request> userRequests = requestService.getRequestsByUser(userId);

            contextBuilder.append("User profile (no password):\n");
            contextBuilder.append("- Name: ").append(user.getFirstName()).append(" ").append(user.getLastName()).append("\n");
            contextBuilder.append("- Email: ").append(user.getEmail()).append("\n");
            contextBuilder.append("- Phone: ").append(user.getPhone()).append("\n");
            contextBuilder.append("- Verified: ").append(user.isVerified()).append("\n");
            contextBuilder.append("- Pickup Address: ").append(user.getPickupAddress()).append("\n");

            contextBuilder.append("User request stats:\n");
            contextBuilder.append("- Total: ").append(userStats.getOrDefault("total", 0L)).append("\n");
            contextBuilder.append("- Pending: ").append(userStats.getOrDefault("pending", 0L)).append("\n");
            contextBuilder.append("- Approved: ").append(userStats.getOrDefault("approved", 0L)).append("\n");
            contextBuilder.append("- Completed: ").append(userStats.getOrDefault("completed", 0L)).append("\n");

            contextBuilder.append("Recent requests (limited):\n");
            userRequests.stream().limit(5).forEach(r -> {
                contextBuilder.append("  - Request ID: ").append(r.getId())
                        .append(", Status: ").append(r.getStatus())
                        .append(", Type: ").append(r.getType())
                        .append(", DeviceType: ").append(r.getDeviceType())
                        .append(", CreatedAt: ").append(r.getCreatedAt())
                        .append("\n");
            });
        }

        // Pickup person ke liye yaha aap chahe to future me context add kar sakte ho
        // (assigned requests count, etc.)

        String systemPrompt =
                "You are EcoSaathi AI Assistant. You must answer all questions clearly and correctly based on the EcoSaathi platform.\n" +
                        "General knowledge base:\n" +
                        "1. EcoSaathi is a platform for responsible e-waste collection and recycling.\n" +
                        "2. To create an account: Click 'Sign Up' → Enter Name, Email, Phone Number → Verify Email → Submit.\n" +
                        "3. To login: Use your registered Email and Password.\n" +
                        "4. If password is forgotten: User must contact Admin.\n" +
                        "5. To submit a pickup request: Login → Dashboard → Click 'New Request' → Upload e-waste photos → Submit.\n" +
                        "6. OTP: A unique OTP is generated for every pickup request. It is visible under Dashboard → My Requests.\n" +
                        "7. Support: Go to Profile → Help & Support → Create a support ticket.\n" +
                        "8. EcoSaathi connects users with certified e-waste pickup agents.\n" +
                        "\nRules:\n" +
                        "- Reply in simple language.\n" +
                        "- Keep answers short and friendly.\n" +
                        "- Use emojis sometimes.\n" +
                        "- Never show or guess any password.\n" +
                        "- Use the dynamic page/role data given below to answer things like total users, pending requests, user requests, etc.\n" +
                        "- If a question is not related to the current page, politely guide the user.\n" +
                        "\nDynamic context from backend:\n" +
                        contextBuilder +
                        "\n";

        String finalPrompt = systemPrompt + "\nUser Question: " + message;

        String url = "http://localhost:11434/api/generate";

        Map<String, Object> request = new HashMap<>();
        request.put("model", "gemma3:1b");
        request.put("prompt", finalPrompt);
        request.put("stream", false);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            return response.getBody().get("response").toString();
        } catch (Exception e) {
            return "AI server is not responding. Please ensure Ollama is running.";
        }
    }
}
