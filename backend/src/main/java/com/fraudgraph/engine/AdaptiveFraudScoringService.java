package com.fraudgraph.engine;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fraudgraph.dto.TransactionRequest;
import com.fraudgraph.model.*;
import com.fraudgraph.repository.AccountRepository;
import com.fraudgraph.repository.FraudAlertRepository;
import com.fraudgraph.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class AdaptiveFraudScoringService {

    private final BehavioralProfilingEngine behavioralEngine;
    private final GraphAnalyticsEngine graphEngine;
    private final ConceptDriftDetector driftDetector;
    private final UncertaintyEstimator uncertaintyEstimator;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final FraudAlertRepository fraudAlertRepository;
    private final ObjectMapper objectMapper;

    public AdaptiveFraudScoringService(BehavioralProfilingEngine behavioralEngine,
                                       GraphAnalyticsEngine graphEngine,
                                       ConceptDriftDetector driftDetector,
                                       UncertaintyEstimator uncertaintyEstimator,
                                       AccountRepository accountRepository,
                                       TransactionRepository transactionRepository,
                                       FraudAlertRepository fraudAlertRepository,
                                       ObjectMapper objectMapper) {
        this.behavioralEngine = behavioralEngine;
        this.graphEngine = graphEngine;
        this.driftDetector = driftDetector;
        this.uncertaintyEstimator = uncertaintyEstimator;
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.fraudAlertRepository = fraudAlertRepository;
        this.objectMapper = objectMapper;
    }

    public static class XaiFactor {
        private String factor;
        private String severity; // INFO, LOW, MEDIUM, HIGH, CRITICAL
        private int impact;      // e.g. +35
        private String explanation;

        public XaiFactor() {}

        public XaiFactor(String factor, String severity, int impact, String explanation) {
            this.factor = factor;
            this.severity = severity;
            this.impact = impact;
            this.explanation = explanation;
        }

        public String getFactor() { return factor; }
        public void setFactor(String factor) { this.factor = factor; }

        public String getSeverity() { return severity; }
        public void setSeverity(String severity) { this.severity = severity; }

        public int getImpact() { return impact; }
        public void setImpact(int impact) { this.impact = impact; }

        public String getExplanation() { return explanation; }
        public void setExplanation(String explanation) { this.explanation = explanation; }
    }

    @Transactional
    public Transaction scoreAndProcessTransaction(TransactionRequest req) {
        String ref = "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Account sender = accountRepository.findByAccountNumber(req.getSenderAccount()).orElse(null);
        Account recipient = accountRepository.findByAccountNumber(req.getRecipientAccount()).orElse(null);

        List<XaiFactor> factors = new ArrayList<>();
        int compositeScore = 0;

        // 1. Behavioral Assessment
        BehavioralProfilingEngine.BehavioralAssessment behav = behavioralEngine.evaluateBehavior(
                sender, req.getAmount(), req.getChannel());
        int behavScore = behav.getBehavioralScore();
        compositeScore += (int) (behavScore * 0.45);

        if (behav.isVelocityAnomaly()) {
            factors.add(new XaiFactor(
                    "Velocity Burst",
                    "HIGH",
                    +30,
                    behav.getDeviationSummary()
            ));
        }
        if (behav.isAmountAnomaly()) {
            factors.add(new XaiFactor(
                    "Amount Outlier (Z-Score)",
                    "HIGH",
                    +25,
                    String.format("Deviation of +%.2fσ from historical account baseline spend", behav.getZScore())
            ));
        }

        // 2. Graph Relationship Analytics
        boolean isCycle = graphEngine.detectsCircularLoop(req.getSenderAccount(), req.getRecipientAccount(), 4);
        boolean isFanInMule = graphEngine.isMuleAccumulatorFanIn(req.getRecipientAccount(), 3);
        boolean isFanOutMule = graphEngine.isMuleDisperserFanOut(req.getSenderAccount(), 3);

        int graphScore = 0;
        if (isCycle) {
            graphScore += 45;
            factors.add(new XaiFactor(
                    "Circular Transaction Cycle",
                    "CRITICAL",
                    +45,
                    String.format("Cyclic routing detected: Funds loop back between %s and %s (layering pattern)",
                            req.getSenderAccount(), req.getRecipientAccount())
            ));
        }

        if (isFanInMule) {
            graphScore += 35;
            factors.add(new XaiFactor(
                    "Accumulator Mule Network (Fan-In)",
                    "HIGH",
                    +35,
                    String.format("Recipient account %s is receiving rapid transfers from multiple distinct originators",
                            req.getRecipientAccount())
            ));
        }

        if (isFanOutMule) {
            graphScore += 35;
            factors.add(new XaiFactor(
                    "Disperser Mule Network (Fan-Out)",
                    "HIGH",
                    +35,
                    String.format("Sender account %s is rapidly scattering funds to multiple distinct recipient wallets",
                            req.getSenderAccount())
            ));
        }

        compositeScore += (int) (graphScore * 0.45);

        // 3. Concept Drift Factor
        double driftScore = driftDetector.getCurrentDriftScore();
        if (driftDetector.isDriftDetected()) {
            int driftPenalty = (int) (driftScore * 20);
            compositeScore += driftPenalty;
            factors.add(new XaiFactor(
                    "Concept Drift Detected",
                    "MEDIUM",
                    +driftPenalty,
                    String.format("Streaming spending pattern diverges from historical model baseline (drift metric: %.2f)", driftScore)
            ));
        }

        // Final score bounded in [0, 100]
        int finalScore = Math.min(100, Math.max(2, compositeScore));

        // 4. Model Uncertainty Quantification
        boolean conflictingSignals = (behavScore > 40 && graphScore == 0) || (graphScore > 40 && behavScore < 20);
        BigDecimal uncertainty = uncertaintyEstimator.calculateUncertainty(finalScore, conflictingSignals, driftScore);

        if (uncertainty.doubleValue() > 0.65) {
            factors.add(new XaiFactor(
                    "Model Uncertainty Peak",
                    "INFO",
                    0,
                    String.format("High epistemic ambiguity (%.2f) near decision threshold; recommended for Human-in-the-Loop review",
                            uncertainty.doubleValue())
            ));
        }

        // 5. Determine Decision Status & Priority
        String status = "APPROVED";
        RiskPriority priority = RiskPriority.LOW;
        boolean isFraudCandidate = false;

        if (finalScore >= 75) {
            status = "BLOCKED";
            priority = RiskPriority.CRITICAL;
            isFraudCandidate = true;
        } else if (finalScore >= 45) {
            status = "UNDER_REVIEW";
            priority = finalScore >= 60 ? RiskPriority.HIGH : RiskPriority.MEDIUM;
            isFraudCandidate = true;
        }

        // Serialize XAI Factors
        String xaiJson = "[]";
        try {
            xaiJson = objectMapper.writeValueAsString(factors);
        } catch (JsonProcessingException e) {
            xaiJson = "[]";
        }

        // Create and persist Transaction
        Transaction txn = new Transaction();
        txn.setTxnReference(ref);
        txn.setSenderAccount(req.getSenderAccount());
        txn.setRecipientAccount(req.getRecipientAccount());
        txn.setAmount(req.getAmount());
        txn.setCurrency(req.getCurrency() != null ? req.getCurrency() : "USD");
        txn.setType(req.getType());
        txn.setChannel(req.getChannel());
        txn.setTimestamp(LocalDateTime.now());
        txn.setLocation(req.getLocation());
        txn.setIpAddress(req.getIpAddress());
        txn.setStatus(status);
        txn.setRiskScore(finalScore);
        txn.setUncertaintyScore(uncertainty);
        txn.setDriftDeviation(BigDecimal.valueOf(driftScore).setScale(4, RoundingMode.HALF_UP));
        txn.setFraudCandidate(isFraudCandidate);
        txn.setXaiFactorsJson(xaiJson);

        Transaction savedTxn = transactionRepository.save(txn);

        // Update In-Memory Graph & Drift windows
        graphEngine.recordTransaction(savedTxn);
        driftDetector.ingestAndEvaluate(savedTxn, behav.getRecentVelocity());

        // Update Account last active timestamp
        if (sender != null) {
            sender.setLastActiveAt(LocalDateTime.now());
            if (finalScore >= 80) sender.setStatus("SUSPICIOUS");
            accountRepository.save(sender);
        }

        // If flagged, raise an Investigation Fraud Alert
        if (isFraudCandidate) {
            FraudAlert alert = new FraudAlert();
            alert.setAlertReference("ALT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            alert.setTxnReference(savedTxn.getTxnReference());
            alert.setSenderAccount(savedTxn.getSenderAccount());
            alert.setRecipientAccount(savedTxn.getRecipientAccount());
            alert.setAmount(savedTxn.getAmount());
            alert.setRiskScore(finalScore);
            alert.setPriority(priority);
            alert.setUncertaintyScore(uncertainty);
            alert.setDriftDeviation(savedTxn.getDriftDeviation());
            alert.setStatus(AlertStatus.OPEN);

            String primaryReason = factors.isEmpty() ? "Statistical threshold exceeded" : factors.get(0).getFactor() + ": " + factors.get(0).getExplanation();
            if (primaryReason.length() > 250) primaryReason = primaryReason.substring(0, 247) + "...";
            alert.setPrimaryReason(primaryReason);
            alert.setXaiFactorsJson(xaiJson);
            alert.setCreatedAt(LocalDateTime.now());
            alert.setUpdatedAt(LocalDateTime.now());

            fraudAlertRepository.save(alert);
        }

        return savedTxn;
    }
}
