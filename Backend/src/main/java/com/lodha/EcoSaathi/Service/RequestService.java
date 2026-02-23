package com.lodha.EcoSaathi.Service;

import com.lodha.EcoSaathi.Config.FileStorageProperties;
import com.lodha.EcoSaathi.Entity.Request;
import com.lodha.EcoSaathi.Entity.PickupPerson;
import com.lodha.EcoSaathi.Entity.User;
import com.lodha.EcoSaathi.Repository.RequestRepository;
import com.lodha.EcoSaathi.Repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Service
public class RequestService {

    private final RequestRepository requestRepository;
    private final UserRepository userRepository;
    private final PickupPersonService pickupPersonService;
    private final FileStorageProperties fileStorageProperties;
    private final EmailService emailService;
    // ✅ NEW: Notification Service
    private final NotificationService notificationService;

    public RequestService(RequestRepository requestRepository,
                          UserRepository userRepository,
                          FileStorageProperties fileStorageProperties,
                          PickupPersonService pickupPersonService,
                          EmailService emailService,
                          NotificationService notificationService) {
        this.requestRepository = requestRepository;
        this.userRepository = userRepository;
        this.fileStorageProperties = fileStorageProperties;
        this.pickupPersonService = pickupPersonService;
        this.emailService = emailService;
        this.notificationService = notificationService;

        try {
            Path fileStorageLocation = Paths.get(fileStorageProperties.getUploadDir()).toAbsolutePath().normalize();
            Files.createDirectories(fileStorageLocation);
        } catch (Exception ex) {
            System.err.println("RequestService: Could not ensure file storage directory exists.");
        }
    }

    // ---------------------------------------------------------------
    // HELPER METHODS (OTP, FILE UPLOAD & GEOCODING)
    // ---------------------------------------------------------------

    private String generateOTP() {
        Random random = new Random();
        int number = 100000 + random.nextInt(900000);
        return String.valueOf(number);
    }

    private double[] getCoordinatesFromAddress(String address) {
        if (address == null || address.trim().isEmpty()) {
            return new double[]{0.0, 0.0};
        }
        try {
            String url = "https://nominatim.openstreetmap.org/search?q=" +
                    address.replace(" ", "+") + "&format=json&limit=1";

            RestTemplate restTemplate = new RestTemplate();
            String response = restTemplate.getForObject(url, String.class);

            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(response);

            if (root.isArray() && root.size() > 0) {
                double lat = root.get(0).get("lat").asDouble();
                double lon = root.get(0).get("lon").asDouble();
                return new double[]{lat, lon};
            }
        } catch (Exception e) {
            System.err.println("Geocoding failed for address: " + address + " | Error: " + e.getMessage());
        }
        return new double[]{0.0, 0.0};
    }

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
                fileUrls.add("http://localhost:8080/images/" + fileName);
            } catch (Exception ex) {
                System.err.println("Multiple File Storage Error: " + ex.getMessage());
                throw new RuntimeException("Could not store file " + file.getOriginalFilename() + ". Please try again!", ex);
            }
        }
        return fileUrls;
    }

    // ---------------------------------------------------------------
    // STATS
    // ---------------------------------------------------------------

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

    // 🔹 NEW: ADMIN DASHBOARD STATS (for chatbot / admin page)
    public Map<String, Long> getAdminStats() {
        List<Request> all = requestRepository.findAll();

        long total = all.size();
        long pending = all.stream().filter(r -> "PENDING".equals(r.getStatus())).count();
        long approved = all.stream().filter(r -> "APPROVED".equals(r.getStatus())).count();
        long scheduled = all.stream().filter(r -> "SCHEDULED".equals(r.getStatus())).count();
        long completed = all.stream().filter(r -> "COMPLETED".equals(r.getStatus())).count();
        long rejected = all.stream().filter(r -> "REJECTED".equals(r.getStatus())).count();

        Map<String, Long> stats = new HashMap<>();
        stats.put("totalRequests", total);
        stats.put("pendingRequests", pending);
        stats.put("approvedRequests", approved);
        stats.put("scheduledRequests", scheduled);
        stats.put("completedRequests", completed);
        stats.put("rejectedRequests", rejected);
        return stats;
    }

    // ---------------------------------------------------------------
    // USER ACTIONS
    // ---------------------------------------------------------------

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

        requestDetails.setPickupOtp(generateOTP());

        Request savedRequest = requestRepository.save(requestDetails);

        try {
            // 📧 EMAIL
            emailService.sendRequestSubmitEmail(
                    user.getEmail(),
                    user.getFirstName() + " " + user.getLastName(),
                    savedRequest.getId(),       // Long
                    savedRequest.getPickupOtp() // String
            );

            // 🔔 NOTIFICATION
            notificationService.createNotification(
                    user,
                    "Request #" + savedRequest.getId() + " submitted successfully! Check email for OTP.",
                    "SUCCESS"
            );

        } catch (Exception e) {
            System.err.println("Failed to send request submission email for request: " + savedRequest.getId());
            e.printStackTrace();
        }

        return savedRequest;
    }

    public List<Request> getRequestsByUser(Long userId) {
        return requestRepository.findByUserId(userId);
    }

    // ---------------------------------------------------------------
    // PICKUP PERSON ACTIONS & TRACKING
    // ---------------------------------------------------------------

    public List<Request> getRequestsByPickupPerson(Long pickupPersonId) {
        return requestRepository.findByAssignedPickupPersonId(pickupPersonId);
    }

    public Map<String, Object> calculateDistanceAndTime(Long requestId, Double pickupLat, Double pickupLng) {
        Request request = findById(requestId);

        if (pickupLat == null || pickupLng == null || pickupLat == 0.0) {
            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("error", "Pickup Person GPS Offline");
            return errorResult;
        }

        double[] userCoords = getCoordinatesFromAddress(request.getPickupLocation());
        double userLat = userCoords[0];
        double userLng = userCoords[1];

        if (userLat == 0.0 || userLng == 0.0) {
            Map<String, Object> result = new HashMap<>();
            result.put("pickupLat", pickupLat);
            result.put("pickupLng", pickupLng);
            result.put("userLat", null);
            result.put("userLng", null);
            result.put("distanceKm", "N/A");
            result.put("estimatedTime", "Checking Address...");
            return result;
        }

        double distanceKm = calculateHaversineDistance(pickupLat, pickupLng, userLat, userLng);

        double timeHours = distanceKm / 30.0;
        int timeMinutes = (int) (timeHours * 60);

        String timeString;
        if (timeMinutes < 1) {
            timeString = "Arriving Now";
        } else if (timeMinutes > 60) {
            timeString = String.format("%d hr %d min", timeMinutes / 60, timeMinutes % 60);
        } else {
            timeString = timeMinutes + " mins";
        }

        Map<String, Object> result = new HashMap<>();
        result.put("distanceKm", String.format("%.2f", distanceKm));
        result.put("estimatedTime", timeString);
        result.put("pickupLat", pickupLat);
        result.put("pickupLng", pickupLng);
        result.put("userLat", userLat);
        result.put("userLng", userLng);

        return result;
    }

    private double calculateHaversineDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    public Request completeRequestWithOtp(Long requestId, String enteredOtp) {
        Request request = findById(requestId);

        if (!"SCHEDULED".equals(request.getStatus())) {
            throw new RuntimeException("Only SCHEDULED requests can be marked as COMPLETED.");
        }

        if (request.getPickupOtp() == null || !request.getPickupOtp().equals(enteredOtp)) {
            throw new RuntimeException("❌ Invalid OTP! Verification failed.");
        }

        String oldStatus = request.getStatus();
        request.setStatus("COMPLETED");
        Request savedRequest = requestRepository.save(request);

        try {
            User user = savedRequest.getUser();
            // 📧 EMAIL
            emailService.sendRequestStatusUpdateEmail(
                    user.getEmail(),
                    user.getFirstName() + " " + user.getLastName(),
                    savedRequest.getId(),
                    oldStatus,
                    "COMPLETED"
            );

            // 🔔 NOTIFICATION
            notificationService.createNotification(
                    user,
                    "Request #" + savedRequest.getId() + " Completed! Thank you for recycling.",
                    "SUCCESS"
            );

        } catch (Exception e) {
            System.err.println("Failed to send completion email for request: " + requestId);
            e.printStackTrace();
        }

        return savedRequest;
    }

    // ---------------------------------------------------------------
    // ADMIN ACTIONS
    // ---------------------------------------------------------------

    public List<Request> getAllPendingRequests() {
        return requestRepository.findAll().stream()
                .filter(r -> "PENDING".equals(r.getStatus()))
                .collect(Collectors.toList());
    }

    public List<Request> getAllRequests() {
        return requestRepository.findAll();
    }

    public Request findById(Long requestId) {
        return requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found with id: " + requestId));
    }

    public Request approveRequest(Long requestId) {
        Request request = findById(requestId);

        if (!"PENDING".equals(request.getStatus())) {
            throw new RuntimeException("Only PENDING requests can be APPROVED.");
        }

        String oldStatus = request.getStatus();
        request.setStatus("APPROVED");
        Request savedRequest = requestRepository.save(request);

        try {
            User user = savedRequest.getUser();
            // 📧 EMAIL
            emailService.sendRequestStatusUpdateEmail(
                    user.getEmail(),
                    user.getFirstName() + " " + user.getLastName(),
                    savedRequest.getId(),
                    oldStatus,
                    "APPROVED"
            );

            // 🔔 NOTIFICATION
            notificationService.createNotification(
                    user,
                    "Great News! Your Request #" + savedRequest.getId() + " is APPROVED.",
                    "SUCCESS"
            );

        } catch (Exception e) { e.printStackTrace(); }

        return savedRequest;
    }

    public Request rejectRequest(Long requestId) {
        Request request = findById(requestId);

        if (!"PENDING".equals(request.getStatus()) && !"APPROVED".equals(request.getStatus())) {
            throw new RuntimeException("Only PENDING or APPROVED requests can be REJECTED.");
        }

        String oldStatus = request.getStatus();
        request.setStatus("REJECTED");
        Request savedRequest = requestRepository.save(request);

        try {
            User user = savedRequest.getUser();
            // 📧 EMAIL
            emailService.sendRequestStatusUpdateEmail(
                    user.getEmail(),
                    user.getFirstName() + " " + user.getLastName(),
                    savedRequest.getId(),
                    oldStatus,
                    "REJECTED"
            );

            // 🔔 NOTIFICATION
            notificationService.createNotification(
                    user,
                    "Update: Request #" + savedRequest.getId() + " was REJECTED. Contact support for details.",
                    "ERROR"
            );

        } catch (Exception e) { e.printStackTrace(); }

        return savedRequest;
    }

    public Request scheduleRequest(Long requestId, LocalDateTime scheduledTime, Long pickupPersonId) {
        Request request = findById(requestId);

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

        // 1. Notify User of Status Update (Generic)
        try {
            // 📧 EMAIL 1
            emailService.sendRequestStatusUpdateEmail(
                    user.getEmail(),
                    user.getFirstName() + " " + user.getLastName(),
                    savedRequest.getId(),
                    oldStatus,
                    "SCHEDULED"
            );
        } catch (Exception e) { e.printStackTrace(); }

        // 2. Notify User of Scheduled Pickup (With Vehicle Details)
        try {
            // 📧 EMAIL 2
            emailService.sendPickupAssignmentEmail(
                    user.getEmail(),
                    pickupPerson.getName(),
                    pickupPerson.getVehicleNumber(),
                    pickupPerson.getVehicleType(),
                    savedRequest.getId(),
                    scheduledTime
            );

            // 🔔 NOTIFICATION
            notificationService.createNotification(
                    user,
                    "Pickup Scheduled for Request #" + savedRequest.getId() + "! Check email for vehicle details.",
                    "INFO"
            );

        } catch (Exception e) { e.printStackTrace(); }

        return savedRequest;
    }

    public Request completeRequest(Long requestId) {
        Request request = findById(requestId);

        if (request.getPickupOtp() != null) {
            return completeRequestWithOtp(requestId, request.getPickupOtp());
        }

        request.setStatus("COMPLETED");
        return requestRepository.save(request);
    }
}