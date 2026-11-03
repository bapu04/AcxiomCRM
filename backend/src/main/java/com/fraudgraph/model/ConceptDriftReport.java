package com.fraudgraph.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "concept_drift_reports")
public class ConceptDriftReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime timestamp = LocalDateTime.now();

    @Column(nullable = false)
    private int windowSize;

    @Column(nullable = false)
    private boolean detectedDrift;

    @Column(nullable = false, precision = 5, scale = 4)
    private BigDecimal driftScore; // 0.0000 - 1.0000

    @Column(precision = 15, scale = 2)
    private BigDecimal meanAmountBaseline;

    @Column(precision = 15, scale = 2)
    private BigDecimal meanAmountCurrent;

    @Column(precision = 8, scale = 2)
    private BigDecimal velocityBaseline;

    @Column(precision = 8, scale = 2)
    private BigDecimal velocityCurrent;

    @Column(precision = 6, scale = 4)
    private BigDecimal pValueOrDistance;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String flaggedPatternsJson;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String notes;

    public ConceptDriftReport() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public int getWindowSize() { return windowSize; }
    public void setWindowSize(int windowSize) { this.windowSize = windowSize; }

    public boolean isDetectedDrift() { return detectedDrift; }
    public void setDetectedDrift(boolean detectedDrift) { this.detectedDrift = detectedDrift; }

    public BigDecimal getDriftScore() { return driftScore; }
    public void setDriftScore(BigDecimal driftScore) { this.driftScore = driftScore; }

    public BigDecimal getMeanAmountBaseline() { return meanAmountBaseline; }
    public void setMeanAmountBaseline(BigDecimal meanAmountBaseline) { this.meanAmountBaseline = meanAmountBaseline; }

    public BigDecimal getMeanAmountCurrent() { return meanAmountCurrent; }
    public void setMeanAmountCurrent(BigDecimal meanAmountCurrent) { this.meanAmountCurrent = meanAmountCurrent; }

    public BigDecimal getVelocityBaseline() { return velocityBaseline; }
    public void setVelocityBaseline(BigDecimal velocityBaseline) { this.velocityBaseline = velocityBaseline; }

    public BigDecimal getVelocityCurrent() { return velocityCurrent; }
    public void setVelocityCurrent(BigDecimal velocityCurrent) { this.velocityCurrent = velocityCurrent; }

    public BigDecimal getPValueOrDistance() { return pValueOrDistance; }
    public void setPValueOrDistance(BigDecimal pValueOrDistance) { this.pValueOrDistance = pValueOrDistance; }

    public String getFlaggedPatternsJson() { return flaggedPatternsJson; }
    public void setFlaggedPatternsJson(String flaggedPatternsJson) { this.flaggedPatternsJson = flaggedPatternsJson; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
