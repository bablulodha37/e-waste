package com.lodha.EcoSaathi.Controller;

import com.lodha.EcoSaathi.Entity.PickupPerson;
import com.lodha.EcoSaathi.Entity.Request;
import com.lodha.EcoSaathi.Service.PickupPersonService;
import com.lodha.EcoSaathi.Service.RequestService;
import org.springframework.web.bind.annotation.*;

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
    public Request markRequestAsCompleted(@PathVariable Long requestId) {
        return requestService.completeRequest(requestId);
    }

    // ---------------------------------------------------------------
    // UPDATE PICKUP PERSON LIVE LOCATION
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
    // FETCH PICKUP PERSON LIVE LOCATION FOR USER
    // ---------------------------------------------------------------
    @GetMapping("/request/{requestId}/pickup-location")
    public Map<String, Object> getPickupPersonLocation(@PathVariable Long requestId) {

        Request request = requestService.findById(requestId);
        PickupPerson person = request.getAssignedPickupPerson();

        Map<String, Object> data = new HashMap<>();
        data.put("name", person.getName());
        data.put("latitude", person.getLatitude());
        data.put("longitude", person.getLongitude());

        return data;
    }
}
