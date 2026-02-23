package com.lodha.EcoSaathi.Controller;

import com.lodha.EcoSaathi.Entity.PickupPerson;
import com.lodha.EcoSaathi.Entity.Request;
import com.lodha.EcoSaathi.Service.PickupPersonService;
import com.lodha.EcoSaathi.Service.RequestService;
import org.springframework.web.bind.annotation.*;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pickup")
@CrossOrigin(origins = "*")
public class PickupPersonController {

    private final PickupPersonService pickupPersonService;
    private final RequestService requestService;

    public PickupPersonController(PickupPersonService pickupPersonService, RequestService requestService) {
        this.pickupPersonService = pickupPersonService;
        this.requestService = requestService;
    }

    // ---------------------------------------------------------------
    // LOGIN
    // ---------------------------------------------------------------
    @PostMapping("/login")
    public PickupPerson loginPickupPerson(
            @RequestParam String email,
            @RequestParam String password
    ) {
        return pickupPersonService.login(email, password);
    }

    // ---------------------------------------------------------------
    // GET ASSIGNED REQUESTS
    // ---------------------------------------------------------------
    @GetMapping("/{id}/requests")
    public List<Request> getAssignedRequests(@PathVariable Long id) {
        return requestService.getRequestsByPickupPerson(id);
    }

    // ---------------------------------------------------------------
    // GET PICKUP PERSON BY ID
    // ---------------------------------------------------------------
    @GetMapping("/{id}")
    public PickupPerson getPickupPersonById(@PathVariable Long id) {
        return pickupPersonService.getPickupPersonById(id);
    }

    // ---------------------------------------------------------------
    // MARK REQUEST AS COMPLETED
    // ---------------------------------------------------------------
    @PutMapping("/request/complete/{requestId}")
    public Request markRequestAsCompleted(
            @PathVariable Long requestId,
            @RequestBody Map<String, String> payload) {

        String otp = payload.get("otp");
        if (otp == null || otp.isEmpty()) {
            throw new RuntimeException("OTP is required to complete the request.");
        }
        return requestService.completeRequestWithOtp(requestId, otp);
    }

    // ---------------------------------------------------------------
    // TRACK REQUEST → ONLY GOOGLE MAP LINK (NO CUSTOM MAP)
    // ---------------------------------------------------------------
    @GetMapping("/request/{requestId}/track")
    public Map<String, Object> trackRequest(@PathVariable Long requestId) {

        Request request = requestService.findById(requestId);
        PickupPerson person = request.getAssignedPickupPerson();

        if (person == null) {
            throw new RuntimeException("No Pickup Person assigned yet.");
        }

        Map<String, Object> data = new HashMap<>();

        String origin = request.getPickupLocation();
        String destination = person.getLatitude() + "," + person.getLongitude();

        String encodedOrigin = origin != null ?
                URLEncoder.encode(origin, StandardCharsets.UTF_8) :
                "";

        String encodedDestination = URLEncoder.encode(destination, StandardCharsets.UTF_8);

        String googleMapsUrl =
                "https://www.google.com/maps/dir/?api=1&origin="
                        + encodedOrigin
                        + "&destination="
                        + encodedDestination;

        data.put("pickupPersonName", person.getName());
        data.put("pickupLatitude", person.getLatitude());
        data.put("pickupLongitude", person.getLongitude());
        data.put("userAddress", origin);
        data.put("googleMapsUrl", googleMapsUrl);

        return data;
    }

    // ---------------------------------------------------------------
    // UPDATE LIVE LOCATION
    // ---------------------------------------------------------------
    @PutMapping("/location/update/{id}")
    public PickupPerson updateLocation(
            @PathVariable Long id,
            @RequestParam Double latitude,
            @RequestParam Double longitude
    ) {
        PickupPerson person = pickupPersonService.getPickupPersonById(id);
        person.setLatitude(latitude);
        person.setLongitude(longitude);
        return pickupPersonService.save(person);
    }

    // ---------------------------------------------------------------
    // FETCH PICKUP PERSON LOCATION (ONLY GOOGLE MAP URL)
    // ---------------------------------------------------------------
    @GetMapping("/request/{requestId}/pickup-location")
    public Map<String, Object> getPickupPersonLocation(@PathVariable Long requestId) {

        Request request = requestService.findById(requestId);
        PickupPerson person = request.getAssignedPickupPerson();

        if (person == null) {
            throw new RuntimeException("No Pickup Person assigned yet.");
        }

        Map<String, Object> data = new HashMap<>();
        data.put("name", person.getName());
        data.put("latitude", person.getLatitude());
        data.put("longitude", person.getLongitude());
        data.put("pickupAddress", request.getPickupLocation());

        String origin = request.getPickupLocation();
        String destination = person.getLatitude() + "," + person.getLongitude();

        String encodedOrigin = URLEncoder.encode(origin, StandardCharsets.UTF_8);
        String encodedDestination = URLEncoder.encode(destination, StandardCharsets.UTF_8);

        String googleMapsUrl =
                "https://www.google.com/maps/dir/?api=1&origin="
                        + encodedOrigin
                        + "&destination="
                        + encodedDestination;

        data.put("googleMapsUrl", googleMapsUrl);

        return data;
    }
}
