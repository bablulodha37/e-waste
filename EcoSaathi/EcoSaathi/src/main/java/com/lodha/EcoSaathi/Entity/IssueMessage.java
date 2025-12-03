package com.lodha.EcoSaathi.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore; // ✅ Import this
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "issue_messages")
public class IssueMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String senderRole;
    private String senderName;

    @Column(length = 2000)
    private String message;

    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "issue_id", nullable = false)
    @JsonIgnore
    private Issue issue;
}