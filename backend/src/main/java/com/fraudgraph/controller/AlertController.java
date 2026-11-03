package com.fraudgraph.controller;

import com.fraudgraph.dto.AlertResponse;
import com.fraudgraph.dto.CaseResolutionRequest;
import com.fraudgraph.service.AlertService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    private final AlertService alertService;

    public AlertController(AlertService alertService) {
        this.alertService = alertService;
    }

    @GetMapping
    public ResponseEntity<Page<AlertResponse>> getAllAlerts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(alertService.getAllAlerts(page, size));
    }

    @GetMapping("/prioritized")
    public ResponseEntity<List<AlertResponse>> getPrioritizedQueue(
            @RequestParam(defaultValue = "15") int limit) {
        return ResponseEntity.ok(alertService.getPrioritizedQueue(limit));
    }

    @GetMapping("/{reference}")
    public ResponseEntity<AlertResponse> getAlertByReference(@PathVariable String reference) {
        return alertService.getAlertByReference(reference)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{reference}/resolve")
    public ResponseEntity<AlertResponse> resolveAlert(
            @PathVariable String reference,
            @Valid @RequestBody CaseResolutionRequest req,
            Authentication authentication) {
        String investigator = authentication != null ? authentication.getName() : "investigator";
        AlertResponse response = alertService.updateAlertStatus(reference, req, investigator);
        return ResponseEntity.ok(response);
    }
}
