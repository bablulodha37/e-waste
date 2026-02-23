package com.lodha.EcoSaathi.Controller;

import com.lodha.EcoSaathi.Service.ChatBotService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/bot")
@CrossOrigin(origins = "*")
public class ChatBotController {

    private final ChatBotService chatBotService;

    public ChatBotController(ChatBotService chatBotService) {
        this.chatBotService = chatBotService;
    }

    @PostMapping("/chat")
    public Map<String, String> chat(@RequestBody Map<String, Object> payload) {
        String message = (String) payload.get("message");
        String page = payload.get("page") != null ? payload.get("page").toString() : "UNKNOWN";
        String role = payload.get("role") != null ? payload.get("role").toString() : "GUEST";

        Long userId = null;
        if (payload.get("userId") != null) {
            userId = Long.valueOf(payload.get("userId").toString());
        }

        Long pickupPersonId = null;
        if (payload.get("pickupPersonId") != null) {
            pickupPersonId = Long.valueOf(payload.get("pickupPersonId").toString());
        }

        String response = chatBotService.getResponse(message, page, role, userId, pickupPersonId);
        return Map.of("response", response);
    }
}
