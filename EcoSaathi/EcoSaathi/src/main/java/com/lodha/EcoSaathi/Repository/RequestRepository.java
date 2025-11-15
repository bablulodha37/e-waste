package com.lodha.EcoSaathi.Repository;

import com.lodha.EcoSaathi.Entity.Request;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RequestRepository extends JpaRepository<Request, Long> {

    // Custom method to fetch all requests for a specific user
    List<Request> findByUserId(Long userId);

    // ✅ NEW: Fetch all requests assigned to a specific pickup person
    List<Request> findByAssignedPickupPersonId(Long pickupPersonId);
}
