package com.fraudgraph.service;

import com.fraudgraph.dto.TransactionRequest;
import com.fraudgraph.dto.TransactionResponse;
import com.fraudgraph.engine.AdaptiveFraudScoringService;
import com.fraudgraph.model.Transaction;
import com.fraudgraph.repository.TransactionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AdaptiveFraudScoringService scoringService;

    public TransactionService(TransactionRepository transactionRepository,
                              AdaptiveFraudScoringService scoringService) {
        this.transactionRepository = transactionRepository;
        this.scoringService = scoringService;
    }

    public TransactionResponse processTransaction(TransactionRequest request) {
        Transaction txn = scoringService.scoreAndProcessTransaction(request);
        return TransactionResponse.fromEntity(txn);
    }

    public Page<TransactionResponse> getRecentTransactions(int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timestamp"));
        return transactionRepository.findAll(pageRequest).map(TransactionResponse::fromEntity);
    }

    public List<TransactionResponse> getTopRecentTransactions() {
        return transactionRepository.findTop50ByOrderByTimestampDesc()
                .stream().map(TransactionResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public Optional<TransactionResponse> getTransactionByReference(String reference) {
        return transactionRepository.findByTxnReference(reference).map(TransactionResponse::fromEntity);
    }
}
