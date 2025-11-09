package com.lodha.EcoSaathi.Config;

import com.lodha.EcoSaathi.Entity.User;
import com.lodha.EcoSaathi.Repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Configuration
public class DataLoader {

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Bean
    public CommandLineRunner initDatabase(UserRepository userRepository) {
        return args -> {

            if (userRepository.findByEmail("admin@ecosaathi.com").isEmpty()) {

                User admin = new User();

                admin.setEmail("admin@ecosaathi.com");
                //  Set the admin's first name
                admin.setFirstName("EcoSaathi");
                admin.setLastName("Admin"); // Set a last name for consistency

                admin.setPassword(passwordEncoder.encode("Admin@123"));
                admin.setRole("ADMIN");
                admin.setVerified(true);
                admin.setPhone("9876543210");

                userRepository.save(admin);
                System.out.println("Admin User created with email: admin@ecosaathi.com");
            }
        };
    }
}