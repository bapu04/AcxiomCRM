package com.fraudgraph.controller;

import com.fraudgraph.dto.TransactionRequest;
import com.fraudgraph.dto.TransactionResponse;
import com.fraudgraph.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @PostMapping
    public ResponseEntity<TransactionResponse> createAndScoreTransaction(@Valid @RequestBody TransactionRequest req) {
        TransactionResponse res = transactionService.processTransaction(req);
        return ResponseEntity.ok(res);
    }

    @GetMapping
    public ResponseEntity<Page<TransactionResponse>> getTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(transactionService.getRecentTransactions(page, size));
    }

    @GetMapping("/recent")
    public ResponseEntity<List<TransactionResponse>> getTopRecent() {
        return ResponseEntity.ok(transactionService.getTopRecentTransactions());
    }

    @GetMapping("/{reference}")
    public ResponseEntity<TransactionResponse> getByReference(@PathVariable String reference) {
        return transactionService.getTransactionByReference(reference)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
