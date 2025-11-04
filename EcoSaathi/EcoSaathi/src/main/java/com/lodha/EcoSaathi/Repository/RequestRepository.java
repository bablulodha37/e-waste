package com.lodha.EcoSaathi.Repository;

import com.lodha.EcoSaathi.Entity.Request;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RequestRepository extends JpaRepository<Request, Long> {
    // Custom method to fetch all requests for a specific user
    List<Request> findByUserId(Long userId);
}