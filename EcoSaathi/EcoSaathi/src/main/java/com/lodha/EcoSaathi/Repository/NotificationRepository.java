package com.lodha.EcoSaathi.Repository;

import com.lodha.EcoSaathi.Entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    // Fetch notifications for a user, newest first
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
    // Add to NotificationRepository.java
    long countByUserIdAndIsReadFalse(Long userId);
}