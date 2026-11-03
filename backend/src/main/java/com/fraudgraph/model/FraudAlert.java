package com.fraudgraph.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "fraud_alerts")
public class FraudAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 64)
    private String alertReference;

    @Column(nullable = false, length = 64)
    private String txnReference;

    @Column(nullable = false, length = 64)
    private String senderAccount;

    @Column(nullable = false, length = 64)
    private String recipientAccount;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    private int riskScore;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private RiskPriority priority; // LOW, MEDIUM, HIGH, CRITICAL

    @Column(nullable = false, precision = 5, scale = 4)
    private BigDecimal uncertaintyScore = BigDecimal.ZERO;

    @Column(nullable = false, precision = 5, scale = 4)
    private BigDecimal driftDeviation = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private AlertStatus status = AlertStatus.OPEN;

    @Column(nullable = false, length = 255)
    private String primaryReason;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String xaiFactorsJson;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String investigatorNotes;

    @Column(length = 64)
    private String assignedTo;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public FraudAlert() {}

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
