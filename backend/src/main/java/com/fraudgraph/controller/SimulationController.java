package com.fraudgraph.controller;

import com.fraudgraph.dto.DriftSimulationRequest;
import com.fraudgraph.dto.TransactionResponse;
import com.fraudgraph.service.StreamingSimulatorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/simulation")
public class SimulationController {

    private final StreamingSimulatorService simulatorService;

    public SimulationController(StreamingSimulatorService simulatorService) {
        this.simulatorService = simulatorService;
    }

    @PostMapping("/batch")
    public ResponseEntity<List<TransactionResponse>> runBatch(@RequestBody DriftSimulationRequest req) {
        List<TransactionResponse> results = simulatorService.runBatchSimulation(req);
        return ResponseEntity.ok(results);
    }

    @PostMapping("/single")
    public ResponseEntity<TransactionResponse> generateSingle() {
        TransactionResponse res = simulatorService.generateSingleNormalTransaction();
        return ResponseEntity.ok(res);
    }

    @PostMapping("/toggle")
    public ResponseEntity<Map<String, Object>> toggleStreaming(@RequestBody Map<String, Object> body) {
        boolean active = Boolean.TRUE.equals(body.get("active"));
        String scenario = (String) body.getOrDefault("scenario", "NORMAL_STREAM");

        boolean state = simulatorService.toggleStreaming(active, scenario);

        Map<String, Object> res = new HashMap<>();
        res.put("streamingActive", state);
        res.put("scenario", simulatorService.getCurrentStreamingScenario());
        return ResponseEntity.ok(res);
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        Map<String, Object> res = new HashMap<>();
        res.put("streamingActive", simulatorService.isStreaming());
        res.put("scenario", simulatorService.getCurrentStreamingScenario());
        return ResponseEntity.ok(res);
    }
}
