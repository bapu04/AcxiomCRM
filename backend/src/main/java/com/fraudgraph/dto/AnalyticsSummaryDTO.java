package com.fraudgraph.dto;

import java.math.BigDecimal;
import java.util.Map;

public class AnalyticsSummaryDTO {
    private long totalTransactions;
    private long flaggedTransactions;
    private long blockedTransactions;
    private long underReviewTransactions;
    private double fraudRatePercent;
    private long totalActiveAlerts;
    private long criticalAlerts;
    private long highAlerts;
    private double avgDetectionLatencyMs;
    private double conceptDriftScore;
    private boolean conceptDriftDetected;
    private Map<String, Long> priorityDistribution;
    private Map<String, Long> channelDistribution;

    public AnalyticsSummaryDTO() {}

    public long getTotalTransactions() { return totalTransactions; }
    public void setTotalTransactions(long totalTransactions) { this.totalTransactions = totalTransactions; }

    public long getFlaggedTransactions() { return flaggedTransactions; }
    public void setFlaggedTransactions(long flaggedTransactions) { this.flaggedTransactions = flaggedTransactions; }

    public long getBlockedTransactions() { return blockedTransactions; }
    public void setBlockedTransactions(long blockedTransactions) { this.blockedTransactions = blockedTransactions; }

    public long getUnderReviewTransactions() { return underReviewTransactions; }
    public void setUnderReviewTransactions(long underReviewTransactions) { this.underReviewTransactions = underReviewTransactions; }

    public double getFraudRatePercent() { return fraudRatePercent; }
    public void setFraudRatePercent(double fraudRatePercent) { this.fraudRatePercent = fraudRatePercent; }

    public long getTotalActiveAlerts() { return totalActiveAlerts; }
    public void setTotalActiveAlerts(long totalActiveAlerts) { this.totalActiveAlerts = totalActiveAlerts; }

    public long getCriticalAlerts() { return criticalAlerts; }
    public void setCriticalAlerts(long criticalAlerts) { this.criticalAlerts = criticalAlerts; }

    public long getHighAlerts() { return highAlerts; }
    public void setHighAlerts(long highAlerts) { this.highAlerts = highAlerts; }

    public double getAvgDetectionLatencyMs() { return avgDetectionLatencyMs; }
    public void setAvgDetectionLatencyMs(double avgDetectionLatencyMs) { this.avgDetectionLatencyMs = avgDetectionLatencyMs; }

    public double getConceptDriftScore() { return conceptDriftScore; }
    public void setConceptDriftScore(double conceptDriftScore) { this.conceptDriftScore = conceptDriftScore; }

    public boolean isConceptDriftDetected() { return conceptDriftDetected; }
    public void setConceptDriftDetected(boolean conceptDriftDetected) { this.conceptDriftDetected = conceptDriftDetected; }

    public Map<String, Long> getPriorityDistribution() { return priorityDistribution; }
    public void setPriorityDistribution(Map<String, Long> priorityDistribution) { this.priorityDistribution = priorityDistribution; }

    public Map<String, Long> getChannelDistribution() { return channelDistribution; }
    public void setChannelDistribution(Map<String, Long> channelDistribution) { this.channelDistribution = channelDistribution; }
}
