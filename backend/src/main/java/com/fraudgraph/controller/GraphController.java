package com.fraudgraph.controller;

import com.fraudgraph.dto.GraphVisualizationDTO;
import com.fraudgraph.engine.GraphAnalyticsEngine;
import com.fraudgraph.model.Account;
import com.fraudgraph.repository.AccountRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/graph")
public class GraphController {

    private final GraphAnalyticsEngine graphEngine;
    private final AccountRepository accountRepository;

    public GraphController(GraphAnalyticsEngine graphEngine, AccountRepository accountRepository) {
        this.graphEngine = graphEngine;
        this.accountRepository = accountRepository;
    }

    @GetMapping("/topology")
    public ResponseEntity<GraphVisualizationDTO> getTopology() {
        List<Account> allAccounts = accountRepository.findAll();
        Map<String, Account> lookup = new HashMap<>();
        for (Account a : allAccounts) {
            lookup.put(a.getAccountNumber(), a);
        }

        GraphVisualizationDTO dto = graphEngine.buildGraphTopology(lookup);
        return ResponseEntity.ok(dto);
    }
}
