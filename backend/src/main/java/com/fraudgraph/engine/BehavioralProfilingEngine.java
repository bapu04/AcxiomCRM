package com.fraudgraph.engine;

import com.fraudgraph.model.Account;
import com.fraudgraph.repository.TransactionRepository;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Component
public class BehavioralProfilingEngine {

    private final TransactionRepository transactionRepository;

    public BehavioralProfilingEngine(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    public static class BehavioralAssessment {
        private final int behavioralScore; // 0 - 100
        private final double zScore;
        private final long recentVelocity;
        private final boolean velocityAnomaly;
        private final boolean amountAnomaly;
        private final String deviationSummary;

        public BehavioralAssessment(int behavioralScore, double zScore, long recentVelocity,
                                    boolean velocityAnomaly, boolean amountAnomaly, String deviationSummary) {
            this.behavioralScore = behavioralScore;
            this.zScore = zScore;
            this.recentVelocity = recentVelocity;
            this.velocityAnomaly = velocityAnomaly;
            this.amountAnomaly = amountAnomaly;
            this.deviationSummary = deviationSummary;
        }

        public int getBehavioralScore() { return behavioralScore; }
        public double getZScore() { return zScore; }
        public long getRecentVelocity() { return recentVelocity; }
        public boolean isVelocityAnomaly() { return velocityAnomaly; }
        public boolean isAmountAnomaly() { return amountAnomaly; }
        public String getDeviationSummary() { return deviationSummary; }
    }

    public BehavioralAssessment evaluateBehavior(Account account, BigDecimal amount, String channel) {
        int score = 0;
        double zScore = 0.0;
        long velocityInLast10Min = 0;
        boolean velocityAnomaly = false;
        boolean amountAnomaly = false;
        StringBuilder summary = new StringBuilder();

        if (account != null) {
            // 1. Calculate Velocity Anomaly
            LocalDateTime tenMinAgo = LocalDateTime.now().minusMinutes(10);
            velocityInLast10Min = transactionRepository.countBySenderSince(account.getAccountNumber(), tenMinAgo) + 1;

            int baselineVelocityPerHr = Math.max(1, account.getBaselineVelocityPerHr());
            // Expected velocity in 10 mins = baseline / 6
            double expectedIn10Mins = (double) baselineVelocityPerHr / 6.0;

            if (velocityInLast10Min > Math.max(3, expectedIn10Mins * 4)) {
                velocityAnomaly = true;
                int velPenalty = Math.min(45, (int) (velocityInLast10Min * 9));
                score += velPenalty;
                summary.append(String.format("Rapid Velocity Spike: %d transactions in last 10 mins (baseline: %d/hr). ",
                        velocityInLast10Min, baselineVelocityPerHr));
            }

            // 2. Calculate Spend Amount Z-Score
            BigDecimal baselineMean = account.getBaselineAvgAmount() != null ? account.getBaselineAvgAmount() : new BigDecimal("250.00");
            BigDecimal baselineStdDev = account.getBaselineStdDevAmount() != null && account.getBaselineStdDevAmount().compareTo(BigDecimal.ZERO) > 0
                    ? account.getBaselineStdDevAmount() : new BigDecimal("80.00");

            BigDecimal diff = amount.subtract(baselineMean);
            zScore = diff.divide(baselineStdDev, 2, RoundingMode.HALF_UP).doubleValue();

            if (zScore > 3.0) {
                amountAnomaly = true;
                int zPenalty = (int) Math.min(40, zScore * 8);
                score += zPenalty;
                summary.append(String.format("Spend Deviation Z-Score: +%.2fσ above account normal ($%.2f vs baseline avg $%.2f). ",
                        zScore, amount.doubleValue(), baselineMean.doubleValue()));
            }

            // 3. High Risk Tier Account baseline factor
            if ("HIGH".equalsIgnoreCase(account.getRiskTier())) {
                score += 15;
                summary.append("Originating account is classified in HIGH Risk Tier. ");
            } else if ("SUSPICIOUS".equalsIgnoreCase(account.getStatus())) {
                score += 25;
                summary.append("Originating account currently under SUSPICIOUS status. ");
            }
        } else {
            // Unknown account or guest transfer
            score += 20;
            summary.append("First-time / Unverified entity account. ");
        }

        // 4. Channel Risk Weighting
        if ("WIRE".equalsIgnoreCase(channel) && amount.compareTo(new BigDecimal("5000.00")) > 0) {
            score += 15;
            summary.append("High-value external WIRE transaction channel. ");
        }

        score = Math.min(100, Math.max(0, score));
        return new BehavioralAssessment(score, zScore, velocityInLast10Min, velocityAnomaly, amountAnomaly, summary.toString().trim());
    }
}
