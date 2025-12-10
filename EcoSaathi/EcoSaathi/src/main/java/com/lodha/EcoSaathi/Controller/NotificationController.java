package com.lodha.EcoSaathi.Controller;

import com.lodha.EcoSaathi.Entity.Notification;
import com.lodha.EcoSaathi.Service.NotificationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/user/{userId}")
    public List<Notification> getUserNotifications(@PathVariable Long userId) {
        return notificationService.getUserNotifications(userId);
    }

    // Add to NotificationController.java
    @GetMapping("/user/{userId}/unread-count")
    public long getUnreadCount(@PathVariable Long userId) {
        return notificationService.getUnreadCount(userId);
    }

    @PutMapping("/{id}/read")
    public void markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
    }

    @DeleteMapping("/user/{userId}")
    public void clearAll(@PathVariable Long userId) {
        notificationService.clearAll(userId);
    }
}