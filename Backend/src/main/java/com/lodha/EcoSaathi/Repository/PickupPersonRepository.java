package com.lodha.EcoSaathi.Repository;

import com.lodha.EcoSaathi.Entity.PickupPerson;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PickupPersonRepository extends JpaRepository<PickupPerson, Long> {
    // ✅ Email-based lookup
    Optional<PickupPerson> findByEmail(String email);
}
