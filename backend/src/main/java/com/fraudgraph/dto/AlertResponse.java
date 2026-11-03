package com.fraudgraph.dto;

import com.fraudgraph.model.AlertStatus;
import com.fraudgraph.model.FraudAlert;
import com.fraudgraph.model.RiskPriority;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class AlertResponse {
    private Long id;
    private String alertReference;
    private String txnReference;
    private String senderAccount;
    private String recipientAccount;
    private BigDecimal amount;
    private int riskScore;
    private RiskPriority priority;
    private BigDecimal uncertaintyScore;
    private BigDecimal driftDeviation;
    private AlertStatus status;
    private String primaryReason;
    private String xaiFactorsJson;
    private String investigatorNotes;
    private String assignedTo;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public AlertResponse() {}

    public static AlertResponse fromEntity(FraudAlert a) {
        AlertResponse res = new AlertResponse();
        res.setId(a.getId());
        res.setAlertReference(a.getAlertReference());
        res.setTxnReference(a.getTxnReference());
        res.setSenderAccount(a.getSenderAccount());
        res.setRecipientAccount(a.getRecipientAccount());
        res.setAmount(a.getAmount());
        res.setRiskScore(a.getRiskScore());
        res.setPriority(a.getPriority());
        res.setUncertaintyScore(a.getUncertaintyScore());
        res.setDriftDeviation(a.getDriftDeviation());
        res.setStatus(a.getStatus());
        res.setPrimaryReason(a.getPrimaryReason());
        res.setXaiFactorsJson(a.getXaiFactorsJson());
        res.setInvestigatorNotes(a.getInvestigatorNotes());
        res.setAssignedTo(a.getAssignedTo());
        res.setCreatedAt(a.getCreatedAt());
        res.setUpdatedAt(a.getUpdatedAt());
        return res;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getAlertReference() { return alertReference; }
    public void setAlertReference(String alertReference) { this.alertReference = alertReference; }

    public String getTxnReference() { return txnReference; }
    public void setTxnReference(String txnReference) { this.txnReference = txnReference; }

    public String getSenderAccount() { return senderAccount; }
    public void setSenderAccount(String senderAccount) { this.senderAccount = senderAccount; }

    public String getRecipientAccount() { return recipientAccount; }
    public void setRecipientAccount(String recipientAccount) { this.recipientAccount = recipientAccount; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public int getRiskScore() { return riskScore; }
    public void setRiskScore(int riskScore) { this.riskScore = riskScore; }

    public RiskPriority getPriority() { return priority; }
    public void setPriority(RiskPriority priority) { this.priority = priority; }

    public BigDecimal getUncertaintyScore() { return uncertaintyScore; }
    public void setUncertaintyScore(BigDecimal uncertaintyScore) { this.uncertaintyScore = uncertaintyScore; }

    public BigDecimal getDriftDeviation() { return driftDeviation; }
    public void setDriftDeviation(BigDecimal driftDeviation) { this.driftDeviation = driftDeviation; }

    public AlertStatus getStatus() { return status; }
    public void setStatus(AlertStatus status) { this.status = status; }

    public String getPrimaryReason() { return primaryReason; }
    public void setPrimaryReason(String primaryReason) { this.primaryReason = primaryReason; }

    public String getXaiFactorsJson() { return xaiFactorsJson; }
    public void setXaiFactorsJson(String xaiFactorsJson) { this.xaiFactorsJson = xaiFactorsJson; }

    public String getInvestigatorNotes() { return investigatorNotes; }
    public void setInvestigatorNotes(String investigatorNotes) { this.investigatorNotes = investigatorNotes; }

    public String getAssignedTo() { return assignedTo; }
    public void setAssignedTo(String assignedTo) { this.assignedTo = assignedTo; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
