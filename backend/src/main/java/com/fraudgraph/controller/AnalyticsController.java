package com.fraudgraph.controller;

import com.fraudgraph.dto.AnalyticsSummaryDTO;
import com.fraudgraph.model.ConceptDriftReport;
import com.fraudgraph.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/summary")
    public ResponseEntity<AnalyticsSummaryDTO> getSummary() {
        return ResponseEntity.ok(analyticsService.getSummaryMetrics());
    }

    @GetMapping("/drift-reports")
    public ResponseEntity<List<ConceptDriftReport>> getDriftReports() {
        return ResponseEntity.ok(analyticsService.getRecentDriftReports());
    }
}
