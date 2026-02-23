package com.lodha.EcoSaathi.Service;

import com.lodha.EcoSaathi.Entity.PickupPerson;
import com.lodha.EcoSaathi.Repository.PickupPersonRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PickupPersonService {

    private final PickupPersonRepository pickupPersonRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final EmailService emailService;

    public PickupPersonService(PickupPersonRepository pickupPersonRepository, EmailService emailService) {
        this.pickupPersonRepository = pickupPersonRepository;
        this.emailService = emailService;
    }

    // ✅ CREATE: Add a new Pickup Person
    public PickupPerson addPickupPerson(PickupPerson pickupPerson) {
        if (pickupPerson.getName() == null || pickupPerson.getName().trim().isEmpty()) {
            throw new RuntimeException("Pickup person must have a name.");
        }

        if (pickupPerson.getPassword() == null || pickupPerson.getPassword().isEmpty()) {
            throw new RuntimeException("Pickup person must have a password.");
        }

        // Store plain password temporarily for email
        String plainPassword = pickupPerson.getPassword();

        // Encrypt password before saving
        pickupPerson.setPassword(passwordEncoder.encode(pickupPerson.getPassword()));
        PickupPerson savedPerson = pickupPersonRepository.save(pickupPerson);

        // Send welcome email with credentials
        try {
            emailService.sendPickupPersonWelcomeEmail(
                    savedPerson.getEmail(),
                    savedPerson.getName(),
                    savedPerson.getEmail(),
                    plainPassword  // Send plain password in email
            );
        } catch (Exception e) {
            System.err.println("Failed to send welcome email to pickup person: " + savedPerson.getEmail());
            e.printStackTrace();
            // Don't fail creation if email fails
        }

        return savedPerson;
    }

    // ✅ LOGIN via EMAIL
    public PickupPerson login(String email, String password) {
        PickupPerson person = pickupPersonRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Pickup Person not found with email: " + email));

        if (!passwordEncoder.matches(password, person.getPassword())) {
            throw new RuntimeException("Invalid credentials for Pickup Person.");
        }

        return person;
    }

    // ✅ READ
    public List<PickupPerson> getAllPickupPersons() {
        return pickupPersonRepository.findAll();
    }

    public PickupPerson getPickupPersonById(Long id) {
        return pickupPersonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pickup Person not found with id: " + id));
    }

    // ✅ UPDATE
    public PickupPerson updatePickupPerson(Long id, PickupPerson updatedDetails) {
        PickupPerson existingPerson = getPickupPersonById(id);

        if (updatedDetails.getName() != null) existingPerson.setName(updatedDetails.getName());
        if (updatedDetails.getPhone() != null) existingPerson.setPhone(updatedDetails.getPhone());
        if (updatedDetails.getEmail() != null) existingPerson.setEmail(updatedDetails.getEmail());

        if (updatedDetails.getPassword() != null && !updatedDetails.getPassword().isEmpty()) {
            existingPerson.setPassword(passwordEncoder.encode(updatedDetails.getPassword()));
        }

        return pickupPersonRepository.save(existingPerson);
    }

    // ✅ DELETE
    public void deletePickupPerson(Long id) {
        PickupPerson existingPerson = getPickupPersonById(id);
        pickupPersonRepository.delete(existingPerson);
    }

    public PickupPerson save(PickupPerson person) {
        return pickupPersonRepository.save(person);
    }

}
