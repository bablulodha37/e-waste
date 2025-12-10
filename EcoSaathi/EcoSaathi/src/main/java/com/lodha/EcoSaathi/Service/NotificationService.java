package com.lodha.EcoSaathi.Service;

import com.lodha.EcoSaathi.Entity.Notification;
import com.lodha.EcoSaathi.Entity.User;
import com.lodha.EcoSaathi.Repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    // ✅ Create Notification
    public void createNotification(User user, String message, String type) {
        if (user == null) return;

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage(message);
        notification.setType(type);

        notificationRepository.save(notification);
    }

    // ✅ Get User Notifications
    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    // ✅ Mark as Read
    public void markAsRead(Long id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    // Add to NotificationService.java
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    // ✅ Clear All
    public void clearAll(Long userId) {
        List<Notification> list = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        notificationRepository.deleteAll(list);
    }
}