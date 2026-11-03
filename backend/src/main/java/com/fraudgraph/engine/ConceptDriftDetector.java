package com.fraudgraph.engine;

import com.fraudgraph.model.ConceptDriftReport;
import com.fraudgraph.model.Transaction;
import com.fraudgraph.repository.ConceptDriftReportRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
public class ConceptDriftDetector {

    private final ConceptDriftReportRepository driftReportRepository;

    @Value("${fraud.engine.drift-window-size:50}")
    private int windowSize = 50;

    @Value("${fraud.engine.drift-threshold:0.38}")
    private double driftThreshold = 0.38;

    private final List<Double> amountWindow = new CopyOnWriteArrayList<>();
    private final List<Double> velocityWindow = new CopyOnWriteArrayList<>();

    // Established historical baselines
    private final double BASELINE_MEAN_AMOUNT = 320.0;
    private final double BASELINE_STD_AMOUNT = 110.0;
    private final double BASELINE_AVG_VELOCITY = 1.8;

    private double currentDriftScore = 0.05;
    private boolean isDriftDetected = false;

    public ConceptDriftDetector(ConceptDriftReportRepository driftReportRepository) {
        this.driftReportRepository = driftReportRepository;
    }

    public synchronized double ingestAndEvaluate(Transaction txn, long currentVelocity) {
        amountWindow.add(txn.getAmount().doubleValue());
        velocityWindow.add((double) currentVelocity);

        if (amountWindow.size() > windowSize) {
            amountWindow.remove(0);
        }
        if (velocityWindow.size() > windowSize) {
            velocityWindow.remove(0);
        }

        if (amountWindow.size() < 10) {
            return currentDriftScore;
        }

        // Calculate sample statistics for current window
        double sumAmt = 0;
        for (double a : amountWindow) sumAmt += a;
        double currentMeanAmt = sumAmt / amountWindow.size();

        double sumVel = 0;
        for (double v : velocityWindow) sumVel += v;
        double currentMeanVel = sumVel / velocityWindow.size();

        // Standardized Population Shift (Page-Hinkley / Normalized distance)
        double amountShift = Math.abs(currentMeanAmt - BASELINE_MEAN_AMOUNT) / BASELINE_STD_AMOUNT;
        double velocityShift = Math.abs(currentMeanVel - BASELINE_AVG_VELOCITY) / 2.0;

        // Composite Drift Score normalized to [0.0, 1.0]
        double rawScore = (amountShift * 0.45) + (velocityShift * 0.55);
        this.currentDriftScore = Math.min(1.0, Math.max(0.02, rawScore / 3.0));
        this.isDriftDetected = this.currentDriftScore >= driftThreshold;

        // Periodically record drift reports when significant drift occurs
        if (isDriftDetected && amountWindow.size() % 15 == 0) {
            recordDriftReport(currentMeanAmt, currentMeanVel, currentDriftScore);
        }

        return this.currentDriftScore;
    }

    private void recordDriftReport(double meanAmt, double meanVel, double driftScore) {
        ConceptDriftReport report = new ConceptDriftReport();
        report.setTimestamp(LocalDateTime.now());
        report.setWindowSize(amountWindow.size());
        report.setDetectedDrift(true);
        report.setDriftScore(BigDecimal.valueOf(driftScore).setScale(4, RoundingMode.HALF_UP));
        report.setMeanAmountBaseline(BigDecimal.valueOf(BASELINE_MEAN_AMOUNT).setScale(2, RoundingMode.HALF_UP));
        report.setMeanAmountCurrent(BigDecimal.valueOf(meanAmt).setScale(2, RoundingMode.HALF_UP));
        report.setVelocityBaseline(BigDecimal.valueOf(BASELINE_AVG_VELOCITY).setScale(2, RoundingMode.HALF_UP));
        report.setVelocityCurrent(BigDecimal.valueOf(meanVel).setScale(2, RoundingMode.HALF_UP));
        report.setPValueOrDistance(BigDecimal.valueOf(driftScore).setScale(4, RoundingMode.HALF_UP));
        report.setFlaggedPatternsJson("[\"Concept Drift: High-velocity structural distribution shift\", \"Adversarial spending pattern displacement\"]");
        report.setNotes("Statistical drift trigger: Transaction velocity and amount vectors diverged significantly from historical baseline.");
        driftReportRepository.save(report);
    }

    public double getCurrentDriftScore() { return currentDriftScore; }
    public boolean isDriftDetected() { return isDriftDetected; }

    public synchronized void reset() {
        amountWindow.clear();
        velocityWindow.clear();
        currentDriftScore = 0.05;
        isDriftDetected = false;
    }
}
