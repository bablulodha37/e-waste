package com.lodha.EcoSaathi.Repository;

import com.lodha.EcoSaathi.Entity.Issue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface IssueRepository extends JpaRepository<Issue, Long> {

    // ✅ Specific Query to ensure it works 100%
    @Query("SELECT i FROM Issue i WHERE i.user.id = :userId")
    List<Issue> findByUserId(@Param("userId") Long userId);

    @Query("SELECT i FROM Issue i WHERE i.pickupPerson.id = :pickupId")
    List<Issue> findByPickupPersonId(@Param("pickupId") Long pickupId);
}