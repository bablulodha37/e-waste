package com.lodha.EcoSaathi.Repository;

import com.lodha.EcoSaathi.Entity.PickupPerson;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PickupPersonRepository extends JpaRepository<PickupPerson, Long> {
    // You can add custom methods here later, like findByEmail
}