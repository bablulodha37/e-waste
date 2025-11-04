package com.lodha.EcoSaathi.Service;

import com.lodha.EcoSaathi.Config.FileStorageProperties; // 🆕 New Import
import com.lodha.EcoSaathi.Entity.Request;
import com.lodha.EcoSaathi.Entity.User;
import com.lodha.EcoSaathi.Repository.RequestRepository;
import com.lodha.EcoSaathi.Repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile; // 🆕 New Import

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList; // New Import
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;


@Service
public class RequestService {

    private final RequestRepository requestRepository;
    private final UserRepository userRepository;
    private final FileStorageProperties fileStorageProperties; // 🆕 New Field

    // 🆕 Updated Constructor
    public RequestService(RequestRepository requestRepository, UserRepository userRepository, FileStorageProperties fileStorageProperties) {
        this.requestRepository = requestRepository;
        this.userRepository = userRepository;
        this.fileStorageProperties = fileStorageProperties; // Initialize the new dependency

        // Ensure the directory exists (optional, but good practice)
        try {
            Path fileStorageLocation = Paths.get(fileStorageProperties.getUploadDir()).toAbsolutePath().normalize();
            Files.createDirectories(fileStorageLocation);
        } catch (Exception ex) {
            System.err.println("RequestService: Could not ensure file storage directory exists.");
        }
    }

    // --- HELPER METHOD FOR MULTIPLE FILE UPLOAD ---
    // 🆕 New Private Method
    private List<String> saveMultipleFiles(List<MultipartFile> files) {
        List<String> fileUrls = new ArrayList<>();

        // Use the same logic as UserService's saveFile, but in a loop
        for (MultipartFile file : files) {
            if (file.isEmpty()) {
                continue; // Skip empty files
            }
            try {
                String originalFileName = file.getOriginalFilename();
                String fileExtension = "";
                int dotIndex = originalFileName.lastIndexOf('.');
                if (dotIndex > 0) {
                    fileExtension = originalFileName.substring(dotIndex);
                }
                String fileName = UUID.randomUUID().toString() + fileExtension;
                Path targetLocation = Paths.get(fileStorageProperties.getUploadDir()).resolve(fileName);

                Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

                // Return the relative URL
                fileUrls.add("/images/" + fileName);

            } catch (Exception ex) {
                System.err.println("Multiple File Storage Error: " + ex.getMessage());
                // In a real app, you might want a more sophisticated rollback or error message here.
                throw new RuntimeException("Could not store file " + file.getOriginalFilename() + ". Please try again!", ex);
            }
        }
        return fileUrls;
    }

    // --- USER ACTIONS (Updated) ---

    // 🆕 Now accepts List<MultipartFile> along with requestDetails
    public Request submitRequestWithPhotos(Long userId, Request requestDetails, List<MultipartFile> files) {
        if (files.isEmpty()) {
            throw new RuntimeException("At least one photo must be uploaded for the request.");
        }

        // 1. Save files and get URLs
        List<String> photoUrls = saveMultipleFiles(files);

        // 2. Existing request submission logic
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found to submit request."));

        requestDetails.setUser(user);

        if (requestDetails.getPickupLocation() == null || requestDetails.getPickupLocation().isEmpty()) {
            requestDetails.setPickupLocation(user.getPickupAddress());
        }

        // 3. Set the URLs on the Request entity
        requestDetails.setPhotoUrls(photoUrls); // 🆕 Set the photo URLs

        requestDetails.setStatus("PENDING");
        return requestRepository.save(requestDetails);
    }

    //  User views their own requests
    public List<Request> getRequestsByUser(Long userId) {
        return requestRepository.findByUserId(userId);
    }

    // --- ADMIN ACTIONS ---

    //  Admin views all PENDING requests
    public List<Request> getAllPendingRequests() {
        return requestRepository.findAll().stream()
                .filter(r -> "PENDING".equals(r.getStatus()))
                .toList();
    }

    //  Admin manages/schedules a request
    public Request scheduleRequest(Long requestId, LocalDateTime scheduledTime) {
        Request request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found with id: " + requestId));

        if (!"PENDING".equals(request.getStatus())) {
            throw new RuntimeException("Cannot schedule a request that is not PENDING.");
        }

        request.setScheduledTime(scheduledTime);
        request.setStatus("SCHEDULED");
        return requestRepository.save(request);
    }

    // Admin to view all requests
    public List<Request> getAllRequests() {
        return requestRepository.findAll();
    }
}