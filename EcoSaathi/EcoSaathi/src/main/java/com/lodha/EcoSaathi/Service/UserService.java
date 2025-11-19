package com.lodha.EcoSaathi.Service;

import com.lodha.EcoSaathi.Dto.UserDto;
import com.lodha.EcoSaathi.Entity.User;
import com.lodha.EcoSaathi.Repository.UserRepository;
import com.lodha.EcoSaathi.Config.FileStorageProperties;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

// ! REMOVED: java.time.LocalDateTime, java.util.Random

import java.util.List;
import java.util.stream.Collectors;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;


@Service
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final FileStorageProperties fileStorageProperties;
    private final EmailService emailService;

    public UserService(UserRepository userRepository, FileStorageProperties fileStorageProperties, EmailService emailService) {
        this.userRepository = userRepository;
        this.fileStorageProperties = fileStorageProperties;
        this.emailService = emailService;

        // Ensure file upload directory exists
        try {
            Path fileStorageLocation = Paths.get(fileStorageProperties.getUploadDir()).toAbsolutePath().normalize();
            Files.createDirectories(fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }


    public User registerUser(User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email already in use.");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole("USER");
        user.setVerified(false);

        User savedUser = userRepository.save(user);

        // Send welcome email to the newly registered user
        try {
            emailService.sendUserWelcomeEmail(
                    savedUser.getEmail(),
                    savedUser.getFirstName(),
                    savedUser.getLastName()
            );
        } catch (Exception e) {
            System.err.println("Failed to send welcome email to user: " + savedUser.getEmail());
            e.printStackTrace();
            // Don't fail registration if email fails
        }

        return savedUser;
    }

    public User login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }


        return user;
    }

    // verifyUser (Kept for Admin verification as per your instruction)
    public User verifyUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        user.setVerified(true);
        return userRepository.save(user);
    }

    public User unverifyUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Set verified to false to reject/unverify the user
        user.setVerified(false);

        // Also, optionally change the role to prevent future login if you want a complete block
        // user.setRole("REJECTED_USER");

        return userRepository.save(user);
    }

    // updateUser (Unchanged)
    public User updateUser(Long userId, User updatedUserDetails) {
        User existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Update basic details
        if (updatedUserDetails.getFirstName() != null && !updatedUserDetails.getFirstName().isEmpty()) {
            existingUser.setFirstName(updatedUserDetails.getFirstName());
        }
        if (updatedUserDetails.getLastName() != null && !updatedUserDetails.getLastName().isEmpty()) {
            existingUser.setLastName(updatedUserDetails.getLastName());
        }

        // Update Address
        if (updatedUserDetails.getPickupAddress() != null) {
            existingUser.setPickupAddress(updatedUserDetails.getPickupAddress());
        }

        // Email update
        if (updatedUserDetails.getEmail() != null && !updatedUserDetails.getEmail().isEmpty()) {
            existingUser.setEmail(updatedUserDetails.getEmail());
        }

        if (updatedUserDetails.getPhone() != null && !updatedUserDetails.getPhone().isEmpty()) {
            existingUser.setPhone(updatedUserDetails.getPhone());
        }
        if (updatedUserDetails.getPassword() != null && !updatedUserDetails.getPassword().isEmpty()) {
            existingUser.setPassword(passwordEncoder.encode(updatedUserDetails.getPassword()));
        }

        return userRepository.save(existingUser);
    }

    private String saveFile(MultipartFile file) {
        try {
            // 1. Create a unique filename (UUID + extension)
            String originalFileName = file.getOriginalFilename();
            String fileExtension = "";
            int dotIndex = originalFileName.lastIndexOf('.');
            if (dotIndex > 0) {
                fileExtension = originalFileName.substring(dotIndex);
            }
            String fileName = UUID.randomUUID().toString() + fileExtension;

            // 2. Resolve the target path within the 'uploads' folder
            Path targetLocation = Paths.get(fileStorageProperties.getUploadDir()).resolve(fileName);

            // 3. Copy/Save the file to the disk
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);


            return "/images/" + fileName;

        } catch (Exception ex) {
            System.err.println("File Storage Error: " + ex.getMessage());
            throw new RuntimeException("Could not store file " + file.getOriginalFilename() + ". Please try again!", ex);
        }
    }

    public User updateProfilePicture(Long userId, MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty. Cannot upload profile picture.");
        }

        User existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        String fileUrl = saveFile(file); // Calls the real save method
        existingUser.setProfilePictureUrl(fileUrl);

        return userRepository.save(existingUser);
    }

    public User findById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
    }

    public List<UserDto> findAllUsersDto() {
        return userRepository.findAll().stream()
                .map(UserDto::new)
                .collect(Collectors.toList());
    }
}