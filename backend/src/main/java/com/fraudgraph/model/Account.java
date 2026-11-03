package com.fraudgraph.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "accounts")
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 64)
    private String accountNumber;

    @Column(nullable = false, length = 128)
    private String holderName;

    @Column(length = 128)
    private String email;

    @Column(nullable = false, length = 16)
    private String riskTier = "LOW"; // LOW, MEDIUM, HIGH

    @Column(nullable = false, length = 16)
    private String status = "ACTIVE"; // ACTIVE, SUSPICIOUS, FROZEN

    @Column(precision = 15, scale = 2)
    private BigDecimal baselineAvgAmount = new BigDecimal("250.00");

    @Column(precision = 15, scale = 2)
    private BigDecimal baselineStdDevAmount = new BigDecimal("80.00");

    private int baselineVelocityPerHr = 2;

    @Column(length = 8)
    private String country = "US";

    @Column(length = 32)
    private String ipSubnet;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime lastActiveAt = LocalDateTime.now();

    public Account() {}

    public Account(String accountNumber, String holderName, String email, String riskTier,
                   BigDecimal baselineAvgAmount, BigDecimal baselineStdDevAmount, int baselineVelocityPerHr) {
        this.accountNumber = accountNumber;
        this.holderName = holderName;
        this.email = email;
        this.riskTier = riskTier;
        this.baselineAvgAmount = baselineAvgAmount;
        this.baselineStdDevAmount = baselineStdDevAmount;
        this.baselineVelocityPerHr = baselineVelocityPerHr;
        this.createdAt = LocalDateTime.now();
        this.lastActiveAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getAccountNumber() { return accountNumber; }
    public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }

    public String getHolderName() { return holderName; }
    public void setHolderName(String holderName) { this.holderName = holderName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRiskTier() { return riskTier; }
    public void setRiskTier(String riskTier) { this.riskTier = riskTier; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public BigDecimal getBaselineAvgAmount() { return baselineAvgAmount; }
    public void setBaselineAvgAmount(BigDecimal baselineAvgAmount) { this.baselineAvgAmount = baselineAvgAmount; }

    public BigDecimal getBaselineStdDevAmount() { return baselineStdDevAmount; }
    public void setBaselineStdDevAmount(BigDecimal baselineStdDevAmount) { this.baselineStdDevAmount = baselineStdDevAmount; }

    public int getBaselineVelocityPerHr() { return baselineVelocityPerHr; }
    public void setBaselineVelocityPerHr(int baselineVelocityPerHr) { this.baselineVelocityPerHr = baselineVelocityPerHr; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public String getIpSubnet() { return ipSubnet; }
    public void setIpSubnet(String ipSubnet) { this.ipSubnet = ipSubnet; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getLastActiveAt() { return lastActiveAt; }
    public void setLastActiveAt(LocalDateTime lastActiveAt) { this.lastActiveAt = lastActiveAt; }
}
