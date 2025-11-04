package com.lodha.EcoSaathi.Service;

import com.lodha.EcoSaathi.Dto.UserDto;
import com.lodha.EcoSaathi.Entity.User;
import com.lodha.EcoSaathi.Repository.UserRepository;
import com.lodha.EcoSaathi.Config.FileStorageProperties; // ✅ REQUIRED: File Storage Config
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
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
    private final EmailService emailService;
    private final FileStorageProperties fileStorageProperties; // ✅ FINAL DEPENDENCY
    private static final long OTP_VALID_DURATION_MINUTES = 5;

    // Now requires all three final dependencies
    public UserService(UserRepository userRepository, EmailService emailService, FileStorageProperties fileStorageProperties) {
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.fileStorageProperties = fileStorageProperties;

        // सुनिश्चित करें कि फ़ाइल अपलोड डायरेक्टरी मौजूद है
        try {
            Path fileStorageLocation = Paths.get(fileStorageProperties.getUploadDir()).toAbsolutePath().normalize();
            Files.createDirectories(fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    // Helper method to generate a 6-digit OTP (Unchanged)
    private String generateOtp() {
        Random random = new Random();
        int otpValue = 100000 + random.nextInt(900000);
        return String.valueOf(otpValue);
    }

    // registerUser (Unchanged)
    public User registerUser(User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email already in use.");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole("USER");
        user.setVerified(false);

        String otp = generateOtp();
        user.setOtp(otp);
        user.setOtpGeneratedTime(LocalDateTime.now());

        User savedUser = userRepository.save(user);
        emailService.sendOtpEmail(user.getEmail(), otp);

        return savedUser;
    }

    // verifyOtp (Unchanged)
    public User verifyOtp(String email, String otp) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found for verification."));

        if (user.isVerified()) {
            throw new RuntimeException("User is already verified.");
        }

        if (!otp.equals(user.getOtp())) {
            throw new RuntimeException("Invalid OTP.");
        }

        if (user.getOtpGeneratedTime().plusMinutes(OTP_VALID_DURATION_MINUTES).isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP expired. Please register again or request a resend.");
        }

        user.setVerified(true);
        user.setOtp(null);
        user.setOtpGeneratedTime(null);
        return userRepository.save(user);
    }

    // login (Unchanged)
    public User login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        if (!user.isVerified()) {
            throw new RuntimeException("User is not verified. Please verify using OTP.");
        }

        return user;
    }

    // verifyUser (Unchanged)
    public User verifyUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        user.setVerified(true);
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

    //  Real File saving logic
    private String saveFile(MultipartFile file) {
        try {
            // 1. Create a unique filename (UUID + extension)
            String originalFileName = file.getOriginalFilename();
            String fileExtension = "";
            int dotIndex = originalFileName.lastIndexOf('.');
            if (dotIndex > 0) {
                fileExtension = originalFileName.substring(dotIndex);
            }
            // Use UUID to ensure the filename is unique and safe
            String fileName = UUID.randomUUID().toString() + fileExtension;

            // 2. Resolve the target path within the 'uploads' folder
            Path targetLocation = Paths.get(fileStorageProperties.getUploadDir()).resolve(fileName);

            // 3. Copy/Save the file to the disk
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // 4. Return the relative URL that the ResourceController will serve
            // The browser will request: http://localhost:8080/images/{fileName}
            return "/images/" + fileName;

        } catch (Exception ex) {
            System.err.println("File Storage Error: " + ex.getMessage());
            throw new RuntimeException("Could not store file " + file.getOriginalFilename() + ". Please try again!", ex);
        }
    }

    // updateProfilePicture (Unchanged logic, now uses real saveFile)
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

    // findAllUsersDto (Unchanged)
    public List<UserDto> findAllUsersDto() {
        return userRepository.findAll().stream()
                .map(UserDto::new)
                .collect(Collectors.toList());
    }
}