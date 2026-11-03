package com.fraudgraph.engine;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Component
public class UncertaintyEstimator {

    /**
     * Estimates model epistemic uncertainty U in [0.0, 1.0]
     * based on decision boundary distance, signal contradiction, and concept drift deviation.
     */
    public BigDecimal calculateUncertainty(int rawRiskScore, boolean conflictingSignals, double driftDeviation) {
        // Normalized probability p in [0.0, 1.0]
        double p = Math.max(0.0, Math.min(1.0, rawRiskScore / 100.0));

        // Margin uncertainty: maximum near the decision threshold (p = 0.5), minimum near 0 or 1
        // Formulated as 1.0 - 2.0 * |p - 0.5|
        double marginUncertainty = 1.0 - (2.0 * Math.abs(p - 0.5));

        // Signal dissonance penalty (e.g., conflicting behavioral vs graph scores)
        double conflictBonus = conflictingSignals ? 0.20 : 0.0;

        // Concept drift increases epistemic uncertainty because past data distributions may no longer apply
        double driftContribution = driftDeviation * 0.25;

        double combined = (marginUncertainty * 0.55) + conflictBonus + driftContribution;
        double bounded = Math.max(0.02, Math.min(0.98, combined));

        return BigDecimal.valueOf(bounded).setScale(4, RoundingMode.HALF_UP);
    }
}
