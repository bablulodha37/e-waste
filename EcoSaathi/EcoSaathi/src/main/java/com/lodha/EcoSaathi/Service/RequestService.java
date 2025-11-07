package com.lodha.EcoSaathi.Service;

import com.lodha.EcoSaathi.Config.FileStorageProperties;
import com.lodha.EcoSaathi.Entity.Request;
import com.lodha.EcoSaathi.Entity.User;
import com.lodha.EcoSaathi.Repository.RequestRepository;
import com.lodha.EcoSaathi.Repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;


@Service
public class RequestService {

    private final RequestRepository requestRepository;
    private final UserRepository userRepository;
    private final FileStorageProperties fileStorageProperties;

    // 🆕 Updated Constructor (Kept from your original, just for context)
    public RequestService(RequestRepository requestRepository, UserRepository userRepository, FileStorageProperties fileStorageProperties) {
        this.requestRepository = requestRepository;
        this.userRepository = userRepository;
        this.fileStorageProperties = fileStorageProperties;

        // Ensure the directory exists (optional, but good practice)
        try {
            Path fileStorageLocation = Paths.get(fileStorageProperties.getUploadDir()).toAbsolutePath().normalize();
            Files.createDirectories(fileStorageLocation);
        } catch (Exception ex) {
            System.err.println("RequestService: Could not ensure file storage directory exists.");
        }
    }

    // --- HELPER METHOD FOR MULTIPLE FILE UPLOAD (Kept from your original) ---
    private List<String> saveMultipleFiles(List<MultipartFile> files) {
        List<String> fileUrls = new ArrayList<>();
        // ... (your existing saveMultipleFiles logic remains here) ...
        for (MultipartFile file : files) {
            if (file.isEmpty()) {
                continue;
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

                fileUrls.add("/images/" + fileName);

            } catch (Exception ex) {
                System.err.println("Multiple File Storage Error: " + ex.getMessage());
                throw new RuntimeException("Could not store file " + file.getOriginalFilename() + ". Please try again!", ex);
            }
        }
        return fileUrls;
    }

    // --- USER ACTIONS (Kept from your original) ---

    // Submit Request (Kept from your original)
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
        requestDetails.setPhotoUrls(photoUrls);

        requestDetails.setStatus("PENDING"); // Initial status
        return requestRepository.save(requestDetails);
    }

    // User views their own requests (Kept from your original)
    public List<Request> getRequestsByUser(Long userId) {
        return requestRepository.findByUserId(userId);
    }

    // --- ADMIN ACTIONS (Updated) ---

    // Admin views all PENDING requests (Kept from your original)
    public List<Request> getAllPendingRequests() {
        return requestRepository.findAll().stream()
                .filter(r -> "PENDING".equals(r.getStatus()))
                .toList();
    }

    // 🆕 New: Admin approves a PENDING request
    public Request approveRequest(Long requestId) {
        Request request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found with id: " + requestId));

        if (!"PENDING".equals(request.getStatus())) {
            throw new RuntimeException("Only PENDING requests can be APPROVED.");
        }

        request.setStatus("APPROVED"); // New status
        return requestRepository.save(request);
    }

    // 🆕 New: Admin rejects a PENDING request
    public Request rejectRequest(Long requestId) {
        Request request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found with id: " + requestId));

        if (!"PENDING".equals(request.getStatus()) && !"APPROVED".equals(request.getStatus())) {
            throw new RuntimeException("Only PENDING or APPROVED requests can be REJECTED/CANCELLED.");
        }

        request.setStatus("REJECTED"); // New status
        return requestRepository.save(request);
    }

    // Admin manages/schedules an APPROVED request (Updated logic)
    public Request scheduleRequest(Long requestId, LocalDateTime scheduledTime) {
        Request request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found with id: " + requestId));

        // 🔄 Updated: Only APPROVED requests can be scheduled
        if (!"APPROVED".equals(request.getStatus())) {
            throw new RuntimeException("Cannot schedule a request that is not APPROVED. Current status: " + request.getStatus());
        }

        request.setScheduledTime(scheduledTime);
        request.setStatus("SCHEDULED");
        return requestRepository.save(request);
    }

    // 🆕 New: Admin marks a SCHEDULED request as completed
    public Request completeRequest(Long requestId) {
        Request request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found with id: " + requestId));

        if (!"SCHEDULED".equals(request.getStatus())) {
            throw new RuntimeException("Only SCHEDULED requests can be marked as COMPLETED. Current status: " + request.getStatus());
        }

        request.setStatus("COMPLETED");
        return requestRepository.save(request);
    }


    // Admin to view all requests (Kept from your original)
    public List<Request> getAllRequests() {
        return requestRepository.findAll();
    }
}