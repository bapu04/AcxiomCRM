package com.fraudgraph.dto;

import com.fraudgraph.model.Transaction;
import com.fraudgraph.model.TransactionType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class TransactionResponse {
    private Long id;
    private String txnReference;
    private String senderAccount;
    private String recipientAccount;
    private BigDecimal amount;
    private String currency;
    private TransactionType type;
    private String channel;
    private LocalDateTime timestamp;
    private String status;
    private int riskScore;
    private BigDecimal uncertaintyScore;
    private BigDecimal driftDeviation;
    private boolean isFraudCandidate;
    private String xaiFactorsJson;

    public TransactionResponse() {}

    public static TransactionResponse fromEntity(Transaction t) {
        TransactionResponse res = new TransactionResponse();
        res.setId(t.getId());
        res.setTxnReference(t.getTxnReference());
        res.setSenderAccount(t.getSenderAccount());
        res.setRecipientAccount(t.getRecipientAccount());
        res.setAmount(t.getAmount());
        res.setCurrency(t.getCurrency());
        res.setType(t.getType());
        res.setChannel(t.getChannel());
        res.setTimestamp(t.getTimestamp());
        res.setStatus(t.getStatus());
        res.setRiskScore(t.getRiskScore());
        res.setUncertaintyScore(t.getUncertaintyScore());
        res.setDriftDeviation(t.getDriftDeviation());
        res.setFraudCandidate(t.isFraudCandidate());
        res.setXaiFactorsJson(t.getXaiFactorsJson());
        return res;
    }

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
