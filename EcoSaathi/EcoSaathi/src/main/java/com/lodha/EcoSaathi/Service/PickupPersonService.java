package com.lodha.EcoSaathi.Service;

import com.lodha.EcoSaathi.Entity.PickupPerson;
import com.lodha.EcoSaathi.Repository.PickupPersonRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PickupPersonService {

    private final PickupPersonRepository pickupPersonRepository;

    public PickupPersonService(PickupPersonRepository pickupPersonRepository) {
        this.pickupPersonRepository = pickupPersonRepository;
    }

    // CREATE: Add a new Pickup Person
    public PickupPerson addPickupPerson(PickupPerson pickupPerson) {
        // Basic validation: check for required fields, e.g., name or phone
        if (pickupPerson.getName() == null || pickupPerson.getName().trim().isEmpty()) {
            throw new RuntimeException("Pickup person must have a name.");
        }
        return pickupPersonRepository.save(pickupPerson);
    }

    // READ: Get all Pickup Persons
    public List<PickupPerson> getAllPickupPersons() {
        return pickupPersonRepository.findAll();
    }

    // READ: Get a single Pickup Person by ID
    public PickupPerson getPickupPersonById(Long id) {
        return pickupPersonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pickup Person not found with id: " + id));
    }

    // UPDATE: Update existing Pickup Person details
    public PickupPerson updatePickupPerson(Long id, PickupPerson updatedDetails) {
        PickupPerson existingPerson = getPickupPersonById(id);

        // Update fields if provided
        if (updatedDetails.getName() != null) {
            existingPerson.setName(updatedDetails.getName());
        }
        if (updatedDetails.getPhone() != null) {
            existingPerson.setPhone(updatedDetails.getPhone());
        }
        if (updatedDetails.getEmail() != null) {
            existingPerson.setEmail(updatedDetails.getEmail());
        }

        return pickupPersonRepository.save(existingPerson);
    }

    // DELETE: Remove a Pickup Person
    public void deletePickupPerson(Long id) {
        PickupPerson existingPerson = getPickupPersonById(id);
        pickupPersonRepository.delete(existingPerson);
    }
}