package com.fraudgraph.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 64)
    private String txnReference;

    @Column(nullable = false, length = 64)
    private String senderAccount;

    @Column(nullable = false, length = 64)
    private String recipientAccount;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 8)
    private String currency = "USD";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private TransactionType type;

    @Column(nullable = false, length = 32)
    private String channel = "MOBILE_APP"; // MOBILE_APP, WEB, WIRE, ATM, POS

    @Column(nullable = false)
    private LocalDateTime timestamp = LocalDateTime.now();

    @Column(length = 45)
    private String ipAddress;

    @Column(length = 64)
    private String location;

    @Column(nullable = false, length = 32)
    private String status = "APPROVED"; // APPROVED, UNDER_REVIEW, BLOCKED

    @Column(nullable = false)
    private int riskScore = 0; // 0 - 100

    @Column(nullable = false, precision = 5, scale = 4)
    private BigDecimal uncertaintyScore = BigDecimal.ZERO; // 0.0000 - 1.0000

    @Column(nullable = false, precision = 5, scale = 4)
    private BigDecimal driftDeviation = BigDecimal.ZERO; // 0.0000 - 1.0000

    @Column(nullable = false)
    private boolean isFraudCandidate = false;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String xaiFactorsJson;

    public Transaction() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTxnReference() { return txnReference; }
    public void setTxnReference(String txnReference) { this.txnReference = txnReference; }

    public String getSenderAccount() { return senderAccount; }
    public void setSenderAccount(String senderAccount) { this.senderAccount = senderAccount; }

    public String getRecipientAccount() { return recipientAccount; }
    public void setRecipientAccount(String recipientAccount) { this.recipientAccount = recipientAccount; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public TransactionType getType() { return type; }
    public void setType(TransactionType type) { this.type = type; }

    public String getChannel() { return channel; }
    public void setChannel(String channel) { this.channel = channel; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public int getRiskScore() { return riskScore; }
    public void setRiskScore(int riskScore) { this.riskScore = riskScore; }

    public BigDecimal getUncertaintyScore() { return uncertaintyScore; }
    public void setUncertaintyScore(BigDecimal uncertaintyScore) { this.uncertaintyScore = uncertaintyScore; }

    public BigDecimal getDriftDeviation() { return driftDeviation; }
    public void setDriftDeviation(BigDecimal driftDeviation) { this.driftDeviation = driftDeviation; }

    public boolean isFraudCandidate() { return isFraudCandidate; }
    public void setFraudCandidate(boolean fraudCandidate) { isFraudCandidate = fraudCandidate; }

    public String getXaiFactorsJson() { return xaiFactorsJson; }
    public void setXaiFactorsJson(String xaiFactorsJson) { this.xaiFactorsJson = xaiFactorsJson; }
}
