package com.lodha.EcoSaathi.Controller;

import com.lodha.EcoSaathi.Entity.PickupPerson;
import com.lodha.EcoSaathi.Entity.Request;
import com.lodha.EcoSaathi.Service.PickupPersonService;
import com.lodha.EcoSaathi.Service.RequestService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    // ⃣ Pickup Person Login by Email
    @PostMapping("/login")
    public PickupPerson loginPickupPerson(
            @RequestParam String email,
            @RequestParam String password
    ) {
        return pickupPersonService.login(email, password);
    }

    //  Get Assigned Requests for Logged-in Pickup Person
    @GetMapping("/{id}/requests")
    public List<Request> getAssignedRequests(@PathVariable Long id) {
        return requestService.getRequestsByPickupPerson(id);
    }

    //  Get Details of a Pickup Person by ID
    @GetMapping("/{id}")
    public PickupPerson getPickupPersonById(@PathVariable Long id) {
        return pickupPersonService.getPickupPersonById(id);
    }


    // ⃣Mark Request Completed
    @PutMapping("/request/complete/{requestId}")
    public Request markRequestAsCompleted(@PathVariable Long requestId) {
        return requestService.completeRequest(requestId);
    }
}

