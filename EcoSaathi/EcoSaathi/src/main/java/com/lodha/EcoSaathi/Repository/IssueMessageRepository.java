package com.lodha.EcoSaathi.Repository;

import com.lodha.EcoSaathi.Entity.IssueMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IssueMessageRepository extends JpaRepository<IssueMessage, Long> {
    List<IssueMessage> findByIssueIdOrderByCreatedAtAsc(Long issueId);
}
