package com.lodha.EcoSaathi.Service;

import com.lodha.EcoSaathi.Dto.UserDto;
import com.lodha.EcoSaathi.Entity.User;
import com.lodha.EcoSaathi.Repository.UserRepository;
import com.lodha.EcoSaathi.Config.FileStorageProperties;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.Random;

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
    // ✅ NEW: Notification Service
    private final NotificationService notificationService;

    public UserService(UserRepository userRepository,
                       FileStorageProperties fileStorageProperties,
                       EmailService emailService,
                       NotificationService notificationService) {
        this.userRepository = userRepository;
        this.fileStorageProperties = fileStorageProperties;
        this.emailService = emailService;
        this.notificationService = notificationService;

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

            // 🔔 NOTIFICATION
            notificationService.createNotification(
                    savedUser,
                    "Welcome to EcoSaathi! Your account has been created successfully.",
                    "SUCCESS"
            );

        } catch (Exception e) {
            System.err.println("Failed to send welcome email to user: " + savedUser.getEmail());
            e.printStackTrace();
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
        User savedUser = userRepository.save(user);

        // 🔔 NOTIFICATION
        notificationService.createNotification(savedUser, "Your account has been verified by Admin!", "SUCCESS");

        return savedUser;
    }

    public User unverifyUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Set verified to false to reject/unverify the user
        user.setVerified(false);
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

        // Password Update Logic with Notification
        if (updatedUserDetails.getPassword() != null && !updatedUserDetails.getPassword().isEmpty()) {
            existingUser.setPassword(passwordEncoder.encode(updatedUserDetails.getPassword()));

            // 🔔 NOTIFICATION
            notificationService.createNotification(existingUser, "Security Alert: Your password was updated recently.", "WARNING");
        }

        User savedUser = userRepository.save(existingUser);

        // 🔔 GENERAL UPDATE NOTIFICATION
        notificationService.createNotification(savedUser, "Your profile details have been updated.", "INFO");

        return savedUser;
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

        // 🔔 NOTIFICATION
        notificationService.createNotification(existingUser, "Profile picture updated successfully.", "INFO");

        return userRepository.save(existingUser);
    }

    // 🔹 1. Generate OTP for Forgot Password
    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with this email."));

        String otp = String.valueOf(new Random().nextInt(900000) + 100000); // 6 digits
        user.setResetPasswordOtp(otp);
        user.setResetPasswordOtpExpiry(LocalDateTime.now().plusMinutes(10)); // Valid for 10 mins

        userRepository.save(user);

        // 📧 EMAIL
        emailService.sendForgotPasswordOtp(user.getEmail(), otp);

        // 🔔 NOTIFICATION
        notificationService.createNotification(user, "OTP sent to your email for password reset.", "WARNING");
    }

    // 🔹 2. Verify OTP and Reset Password
    public void resetPassword(String email, String otp, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found."));

        if (user.getResetPasswordOtp() == null || !user.getResetPasswordOtp().equals(otp)) {
            throw new RuntimeException("Invalid OTP.");
        }

        if (user.getResetPasswordOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP has expired.");
        }

        // Reset password
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetPasswordOtp(null); // Clear OTP
        user.setResetPasswordOtpExpiry(null);

        userRepository.save(user);

        // 🔔 NOTIFICATION
        notificationService.createNotification(user, "Your password has been reset successfully. You can now login.", "SUCCESS");
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
    // 🔹 Add this at the bottom of UserService class
    public long countAllUsers() {
        return userRepository.count();
    }
}