package com.lodha.EcoSaathi.Service;

import com.lodha.EcoSaathi.Config.FileStorageProperties;
import com.lodha.EcoSaathi.Entity.Request;
import com.lodha.EcoSaathi.Entity.PickupPerson;
import com.lodha.EcoSaathi.Entity.User;
import com.lodha.EcoSaathi.Repository.RequestRepository;
import com.lodha.EcoSaathi.Repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class RequestService {

    private final RequestRepository requestRepository;
    private final UserRepository userRepository;
    private final PickupPersonService pickupPersonService;
    private final FileStorageProperties fileStorageProperties;
    private final EmailService emailService;

    // Constructor
    public RequestService(RequestRepository requestRepository,
                          UserRepository userRepository,
                          FileStorageProperties fileStorageProperties,
                          PickupPersonService pickupPersonService,
                          EmailService emailService) {
        this.requestRepository = requestRepository;
        this.userRepository = userRepository;
        this.fileStorageProperties = fileStorageProperties;
        this.pickupPersonService = pickupPersonService;
        this.emailService = emailService;

        // Ensure upload folder exists
        try {
            Path fileStorageLocation = Paths.get(fileStorageProperties.getUploadDir()).toAbsolutePath().normalize();
            Files.createDirectories(fileStorageLocation);
        } catch (Exception ex) {
            System.err.println("RequestService: Could not ensure file storage directory exists.");
        }
    }

    // ✅ Get Stats for a Specific User (for dashboard & certificate)
    public Map<String, Long> getUserStats(Long userId) {
        List<Request> userRequests = requestRepository.findByUserId(userId);

        long total = userRequests.size();
        long pending = userRequests.stream().filter(r -> "PENDING".equals(r.getStatus())).count();
        long approved = userRequests.stream().filter(r -> "APPROVED".equals(r.getStatus())).count();
        long completed = userRequests.stream().filter(r -> "COMPLETED".equals(r.getStatus())).count();

        Map<String, Long> stats = new HashMap<>();
        stats.put("total", total);
        stats.put("pending", pending);
        stats.put("approved", approved);
        stats.put("completed", completed);
        return stats;
    }

    // --- File Upload Helper for Multiple Files ---
    private List<String> saveMultipleFiles(List<MultipartFile> files) {
        List<String> fileUrls = new ArrayList<>();

        for (MultipartFile file : files) {
            if (file.isEmpty()) continue;
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

    // --- USER ACTIONS ---
    public Request submitRequestWithPhotos(Long userId, Request requestDetails, List<MultipartFile> files) {
        if (files.isEmpty()) {
            throw new RuntimeException("At least one photo must be uploaded for the request.");
        }

        List<String> photoUrls = saveMultipleFiles(files);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found to submit request."));

        requestDetails.setUser(user);

        if (requestDetails.getPickupLocation() == null || requestDetails.getPickupLocation().isEmpty()) {
            requestDetails.setPickupLocation(user.getPickupAddress());
        }

        requestDetails.setPhotoUrls(photoUrls);
        requestDetails.setStatus("PENDING");
        Request savedRequest = requestRepository.save(requestDetails);

        // 👉 NEW: Send email immediately after request submission
        try {
            emailService.sendRequestSubmitEmail(
                    user.getEmail(),
                    user.getFirstName() + " " + user.getLastName(),
                    savedRequest.getId()
            );
        } catch (Exception e) {
            System.err.println("Failed to send request submission email for request: " + savedRequest.getId());
            e.printStackTrace();
        }

        return savedRequest;
    }


    // pickup person dek sakta hai sab request ko
    public List<Request> getRequestsByPickupPerson(Long pickupPersonId) {
        return requestRepository.findByAssignedPickupPersonId(pickupPersonId);
    }



    public List<Request> getRequestsByUser(Long userId) {
        return requestRepository.findByUserId(userId);
    }

    // --- ADMIN ACTIONS ---
    public List<Request> getAllPendingRequests() {
        return requestRepository.findAll().stream()
                .filter(r -> "PENDING".equals(r.getStatus()))
                .collect(Collectors.toList());
    }

    public Request approveRequest(Long requestId) {
        Request request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found with id: " + requestId));

        if (!"PENDING".equals(request.getStatus())) {
            throw new RuntimeException("Only PENDING requests can be APPROVED.");
        }

        String oldStatus = request.getStatus();
        request.setStatus("APPROVED");
        Request savedRequest = requestRepository.save(request);

        // Send status update email to user
        try {
            User user = savedRequest.getUser();
            emailService.sendRequestStatusUpdateEmail(
                    user.getEmail(),
                    user.getFirstName() + " " + user.getLastName(),
                    savedRequest.getId(),
                    oldStatus,
                    "APPROVED"
            );
        } catch (Exception e) {
            System.err.println("Failed to send approval email for request: " + requestId);
            e.printStackTrace();
        }

        return savedRequest;
    }

    public Request rejectRequest(Long requestId) {
        Request request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found with id: " + requestId));

        if (!"PENDING".equals(request.getStatus()) && !"APPROVED".equals(request.getStatus())) {
            throw new RuntimeException("Only PENDING or APPROVED requests can be REJECTED.");
        }

        String oldStatus = request.getStatus();
        request.setStatus("REJECTED");
        Request savedRequest = requestRepository.save(request);

        // Send status update email to user
        try {
            User user = savedRequest.getUser();
            emailService.sendRequestStatusUpdateEmail(
                    user.getEmail(),
                    user.getFirstName() + " " + user.getLastName(),
                    savedRequest.getId(),
                    oldStatus,
                    "REJECTED"
            );
        } catch (Exception e) {
            System.err.println("Failed to send rejection email for request: " + requestId);
            e.printStackTrace();
        }

        return savedRequest;
    }

    public Request scheduleRequest(Long requestId, LocalDateTime scheduledTime, Long pickupPersonId) {
        Request request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found with id: " + requestId));

        if (!"APPROVED".equals(request.getStatus())) {
            throw new RuntimeException("Cannot schedule a request that is not APPROVED.");
        }

        PickupPerson pickupPerson = pickupPersonService.getPickupPersonById(pickupPersonId);

        String oldStatus = request.getStatus();
        request.setAssignedPickupPerson(pickupPerson);
        request.setPickupPersonAssigned(true);
        request.setScheduledTime(scheduledTime);
        request.setStatus("SCHEDULED");
        Request savedRequest = requestRepository.save(request);

        User user = savedRequest.getUser();

        // Send status update email to user
        try {
            emailService.sendRequestStatusUpdateEmail(
                    user.getEmail(),
                    user.getFirstName() + " " + user.getLastName(),
                    savedRequest.getId(),
                    oldStatus,
                    "SCHEDULED"
            );
        } catch (Exception e) {
            System.err.println("Failed to send schedule email to user for request: " + requestId);
            e.printStackTrace();
        }

        // Send pickup assignment email to pickup person
        try {
            emailService.sendPickupAssignmentEmail(
                    pickupPerson.getEmail(),
                    pickupPerson.getName(),
                    savedRequest.getId(),
                    user.getPickupAddress(),
                    user.getFirstName() + " " + user.getLastName(),
                    user.getPhone(),
                    scheduledTime
            );
        } catch (Exception e) {
            System.err.println("Failed to send assignment email to pickup person for request: " + requestId);
            e.printStackTrace();
        }

        return savedRequest;
    }

    public Request completeRequest(Long requestId) {
        Request request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found with id: " + requestId));

        if (!"SCHEDULED".equals(request.getStatus())) {
            throw new RuntimeException("Only SCHEDULED requests can be marked as COMPLETED.");
        }

        String oldStatus = request.getStatus();
        request.setStatus("COMPLETED");
        Request savedRequest = requestRepository.save(request);

        // Send completion email to user
        try {
            User user = savedRequest.getUser();
            emailService.sendRequestStatusUpdateEmail(
                    user.getEmail(),
                    user.getFirstName() + " " + user.getLastName(),
                    savedRequest.getId(),
                    oldStatus,
                    "COMPLETED"
            );
        } catch (Exception e) {
            System.err.println("Failed to send completion email for request: " + requestId);
            e.printStackTrace();
        }

        return savedRequest;
    }

    public List<Request> getAllRequests() {
        return requestRepository.findAll();
    }
}
