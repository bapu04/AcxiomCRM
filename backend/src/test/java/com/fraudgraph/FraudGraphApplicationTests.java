package com.fraudgraph;

import com.fraudgraph.dto.DriftSimulationRequest;
import com.fraudgraph.dto.TransactionRequest;
import com.fraudgraph.dto.TransactionResponse;
import com.fraudgraph.engine.ConceptDriftDetector;
import com.fraudgraph.engine.GraphAnalyticsEngine;
import com.fraudgraph.engine.UncertaintyEstimator;
import com.fraudgraph.model.Transaction;
import com.fraudgraph.model.TransactionType;
import com.fraudgraph.service.StreamingSimulatorService;
import com.fraudgraph.service.TransactionService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class FraudGraphApplicationTests {

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private GraphAnalyticsEngine graphEngine;

    @Autowired
    private UncertaintyEstimator uncertaintyEstimator;

    @Autowired
    private ConceptDriftDetector driftDetector;

    @Autowired
    private StreamingSimulatorService simulatorService;

    @Test
    void contextLoads() {
        assertNotNull(transactionService);
        assertNotNull(graphEngine);
        assertNotNull(uncertaintyEstimator);
        assertNotNull(driftDetector);
    }

    @Test
    void testTransactionScoringAndAlertGeneration() {
        TransactionRequest req = new TransactionRequest();
        req.setSenderAccount("ACC-10003");
        req.setRecipientAccount("ACC-10007");
        req.setAmount(new BigDecimal("12500.00")); // High value outlier
        req.setType(TransactionType.TRANSFER);
        req.setChannel("WIRE");
        req.setLocation("London, UK");

        TransactionResponse response = transactionService.processTransaction(req);
        assertNotNull(response);
        assertNotNull(response.getTxnReference());
        assertTrue(response.getRiskScore() > 0);
        assertNotNull(response.getUncertaintyScore());
        assertNotNull(response.getXaiFactorsJson());
    }

    @Test
    void testCircularLaunderingCycleDetection() {
        // Build circular loop: A -> B -> C -> A
        Transaction t1 = new Transaction();
        t1.setSenderAccount("TEST-ACC-A");
        t1.setRecipientAccount("TEST-ACC-B");
        t1.setAmount(new BigDecimal("5000.00"));
        graphEngine.recordTransaction(t1);

        Transaction t2 = new Transaction();
        t2.setSenderAccount("TEST-ACC-B");
        t2.setRecipientAccount("TEST-ACC-C");
        t2.setAmount(new BigDecimal("4900.00"));
        graphEngine.recordTransaction(t2);

        // Check if C -> A creates a circular loop
        boolean cycleDetected = graphEngine.detectsCircularLoop("TEST-ACC-C", "TEST-ACC-A", 4);
        assertTrue(cycleDetected, "Graph engine should detect 3-hop circular cycle TEST-ACC-A -> B -> C -> A");
    }

    @Test
    void testMuleAccumulatorFanInDetection() {
        String hub = "TEST-MULE-HUB";
        for (int i = 1; i <= 4; i++) {
            Transaction t = new Transaction();
            t.setSenderAccount("TEST-SENDER-" + i);
            t.setRecipientAccount(hub);
            t.setAmount(new BigDecimal("1500.00"));
            graphEngine.recordTransaction(t);
        }

        boolean isMule = graphEngine.isMuleAccumulatorFanIn(hub, 3);
        assertTrue(isMule, "Account with 4 distinct senders should be flagged as an accumulator mule");
    }

    @Test
    void testUncertaintyEstimation() {
        // High margin uncertainty near decision boundary (p = 0.50 => riskScore 50)
        BigDecimal uMid = uncertaintyEstimator.calculateUncertainty(50, false, 0.0);
        // Low uncertainty far from decision boundary (p = 0.95 => riskScore 95)
        BigDecimal uHigh = uncertaintyEstimator.calculateUncertainty(95, false, 0.0);

        assertTrue(uMid.doubleValue() > uHigh.doubleValue(),
                "Decision boundary uncertainty (score 50) should exceed confident risk uncertainty (score 95)");
    }

    @Test
    void testSimulationBatchExecution() {
        DriftSimulationRequest req = new DriftSimulationRequest("NORMAL_STREAM", 3, 0.0);
        List<TransactionResponse> results = simulatorService.runBatchSimulation(req);
        assertEquals(3, results.size());
        for (TransactionResponse tr : results) {
            assertNotNull(tr.getTxnReference());
            assertNotNull(tr.getStatus());
        }
    }
}
