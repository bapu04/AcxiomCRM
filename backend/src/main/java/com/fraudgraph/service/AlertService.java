package com.fraudgraph.service;

import com.fraudgraph.dto.AlertResponse;
import com.fraudgraph.dto.CaseResolutionRequest;
import com.fraudgraph.model.AlertStatus;
import com.fraudgraph.model.FraudAlert;
import com.fraudgraph.model.RiskPriority;
import com.fraudgraph.model.Transaction;
import com.fraudgraph.repository.FraudAlertRepository;
import com.fraudgraph.repository.TransactionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AlertService {

    private final FraudAlertRepository alertRepository;
    private final TransactionRepository transactionRepository;

    public AlertService(FraudAlertRepository alertRepository, TransactionRepository transactionRepository) {
        this.alertRepository = alertRepository;
        this.transactionRepository = transactionRepository;
    }

    public Page<AlertResponse> getAllAlerts(int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return alertRepository.findAll(pageRequest).map(AlertResponse::fromEntity);
    }

    public List<AlertResponse> getPrioritizedQueue(int limit) {
        return alertRepository.findPrioritizedQueue(PageRequest.of(0, limit))
                .stream().map(AlertResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public Optional<AlertResponse> getAlertByReference(String reference) {
        return alertRepository.findByAlertReference(reference)
                .or(() -> alertRepository.findByTxnReference(reference))
                .map(AlertResponse::fromEntity);
    }

    @Transactional
    public AlertResponse updateAlertStatus(String reference, CaseResolutionRequest req, String investigatorUsername) {
        FraudAlert alert = alertRepository.findByAlertReference(reference)
                .or(() -> alertRepository.findByTxnReference(reference))
                .orElseGet(() -> {
                    Transaction txn = transactionRepository.findByTxnReference(reference).orElse(null);
                    FraudAlert newAlert = new FraudAlert();
                    newAlert.setAlertReference("ALT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
                    newAlert.setTxnReference(reference);
                    if (txn != null) {
                        newAlert.setSenderAccount(txn.getSenderAccount());
                        newAlert.setRecipientAccount(txn.getRecipientAccount());
                        newAlert.setAmount(txn.getAmount());
                        newAlert.setRiskScore(txn.getRiskScore());
                        newAlert.setPriority(txn.getRiskScore() >= 75 ? RiskPriority.CRITICAL :
                                txn.getRiskScore() >= 60 ? RiskPriority.HIGH : RiskPriority.MEDIUM);
                        newAlert.setUncertaintyScore(txn.getUncertaintyScore());
                        newAlert.setDriftDeviation(txn.getDriftDeviation());
                        newAlert.setXaiFactorsJson(txn.getXaiFactorsJson());
                    }
                    newAlert.setCreatedAt(LocalDateTime.now());
                    newAlert.setPrimaryReason("Investigator manual action on transaction " + reference);
                    return newAlert;
                });

        alert.setStatus(req.getStatus());
        if (req.getInvestigatorNotes() != null && !req.getInvestigatorNotes().isBlank()) {
            String existingNotes = alert.getInvestigatorNotes() != null ? alert.getInvestigatorNotes() + "\n" : "";
            alert.setInvestigatorNotes(existingNotes + "[" + LocalDateTime.now() + " - " + investigatorUsername + "]: " + req.getInvestigatorNotes());
        }
        alert.setAssignedTo(investigatorUsername);
        alert.setUpdatedAt(LocalDateTime.now());

        FraudAlert updated = alertRepository.save(alert);
        return AlertResponse.fromEntity(updated);
    }
}
