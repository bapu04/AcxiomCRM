package com.fraudgraph.service;

import com.fraudgraph.dto.DriftSimulationRequest;
import com.fraudgraph.dto.TransactionRequest;
import com.fraudgraph.dto.TransactionResponse;
import com.fraudgraph.model.Account;
import com.fraudgraph.model.TransactionType;
import com.fraudgraph.repository.AccountRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.atomic.AtomicBoolean;

@Service
public class StreamingSimulatorService {

    private final TransactionService transactionService;
    private final AccountRepository accountRepository;

    private final AtomicBoolean isStreamingActive = new AtomicBoolean(false);
    private String currentStreamingScenario = "NORMAL_STREAM";

    private final List<String> demoAccounts = Arrays.asList(
            "ACC-10001", "ACC-10002", "ACC-10003", "ACC-10004", "ACC-10005",
            "ACC-10006", "ACC-10007", "ACC-10008", "ACC-10009", "ACC-10010"
    );

    private final List<String> channels = Arrays.asList("MOBILE_APP", "WEB", "ATM", "WIRE", "POS");
    private final List<String> locations = Arrays.asList(
            "New York, US", "San Francisco, US", "London, UK", "Singapore, SG", "Toronto, CA", "Frankfurt, DE"
    );

    public StreamingSimulatorService(TransactionService transactionService,
                                     AccountRepository accountRepository) {
        this.transactionService = transactionService;
        this.accountRepository = accountRepository;
    }

    public List<TransactionResponse> runBatchSimulation(DriftSimulationRequest req) {
        List<TransactionResponse> results = new ArrayList<>();
        int count = Math.min(50, Math.max(1, req.getCount()));

        if ("MULE_ATTACK".equalsIgnoreCase(req.getScenario())) {
            results.addAll(injectMuleAttack(count));
        } else if ("VELOCITY_BURST".equalsIgnoreCase(req.getScenario())) {
            results.addAll(injectVelocityBurst(count));
        } else if ("HIGH_AMOUNT_DRIFT".equalsIgnoreCase(req.getScenario())) {
            results.addAll(injectHighAmountDrift(count));
        } else {
            for (int i = 0; i < count; i++) {
                results.add(generateSingleNormalTransaction());
            }
        }

        return results;
    }

    public TransactionResponse generateSingleNormalTransaction() {
        int uIdx = ThreadLocalRandom.current().nextInt(demoAccounts.size());
        int vIdx = ThreadLocalRandom.current().nextInt(demoAccounts.size());
        while (vIdx == uIdx) {
            vIdx = ThreadLocalRandom.current().nextInt(demoAccounts.size());
        }

        double amt = 15.0 + ThreadLocalRandom.current().nextDouble() * 320.0;
        TransactionRequest req = new TransactionRequest();
        req.setSenderAccount(demoAccounts.get(uIdx));
        req.setRecipientAccount(demoAccounts.get(vIdx));
        req.setAmount(BigDecimal.valueOf(amt).setScale(2, RoundingMode.HALF_UP));
        req.setType(TransactionType.TRANSFER);
        req.setChannel(channels.get(ThreadLocalRandom.current().nextInt(channels.size())));
        req.setLocation(locations.get(ThreadLocalRandom.current().nextInt(locations.size())));
        req.setIpAddress("198.51.100." + ThreadLocalRandom.current().nextInt(1, 250));

        return transactionService.processTransaction(req);
    }

    private List<TransactionResponse> injectMuleAttack(int count) {
        List<TransactionResponse> list = new ArrayList<>();
        // Controlled 3-step circular loop: ACC-10003 -> ACC-10007 -> ACC-10009 -> ACC-10003
        String[] ring = {"ACC-10003", "ACC-10007", "ACC-10009"};
        for (int i = 0; i < Math.max(3, count); i++) {
            String src = ring[i % ring.length];
            String dst = ring[(i + 1) % ring.length];
            TransactionRequest req = new TransactionRequest();
            req.setSenderAccount(src);
            req.setRecipientAccount(dst);
            req.setAmount(new BigDecimal("4850.00"));
            req.setType(TransactionType.TRANSFER);
            req.setChannel("WIRE");
            req.setLocation("London, UK");
            req.setIpAddress("185.220.101.44");
            list.add(transactionService.processTransaction(req));
        }
        return list;
    }

    private List<TransactionResponse> injectVelocityBurst(int count) {
        List<TransactionResponse> list = new ArrayList<>();
        String spammer = "ACC-10004";
        for (int i = 0; i < Math.max(5, count); i++) {
            String dst = demoAccounts.get(ThreadLocalRandom.current().nextInt(demoAccounts.size()));
            TransactionRequest req = new TransactionRequest();
            req.setSenderAccount(spammer);
            req.setRecipientAccount(dst);
            req.setAmount(new BigDecimal("950.00"));
            req.setType(TransactionType.TRANSFER);
            req.setChannel("MOBILE_APP");
            req.setLocation("Toronto, CA");
            req.setIpAddress("198.51.100.99");
            list.add(transactionService.processTransaction(req));
        }
        return list;
    }

    private List<TransactionResponse> injectHighAmountDrift(int count) {
        List<TransactionResponse> list = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            int uIdx = ThreadLocalRandom.current().nextInt(demoAccounts.size());
            int vIdx = (uIdx + 1) % demoAccounts.size();
            double driftAmt = 9000.0 + ThreadLocalRandom.current().nextDouble() * 16000.0;
            TransactionRequest req = new TransactionRequest();
            req.setSenderAccount(demoAccounts.get(uIdx));
            req.setRecipientAccount(demoAccounts.get(vIdx));
            req.setAmount(BigDecimal.valueOf(driftAmt).setScale(2, RoundingMode.HALF_UP));
            req.setType(TransactionType.TRANSFER);
            req.setChannel("WIRE");
            req.setLocation("Frankfurt, DE");
            req.setIpAddress("193.106.191.12");
            list.add(transactionService.processTransaction(req));
        }
        return list;
    }

    @Scheduled(fixedRate = 3000)
    public void processScheduledStream() {
        if (!isStreamingActive.get()) {
            return;
        }

        if ("MULE_ATTACK".equalsIgnoreCase(currentStreamingScenario)) {
            injectMuleAttack(1);
        } else if ("VELOCITY_BURST".equalsIgnoreCase(currentStreamingScenario)) {
            injectVelocityBurst(1);
        } else if ("HIGH_AMOUNT_DRIFT".equalsIgnoreCase(currentStreamingScenario)) {
            injectHighAmountDrift(1);
        } else {
            generateSingleNormalTransaction();
        }
    }

    public boolean toggleStreaming(boolean active, String scenario) {
        this.isStreamingActive.set(active);
        if (scenario != null && !scenario.isBlank()) {
            this.currentStreamingScenario = scenario;
        }
        return this.isStreamingActive.get();
    }

    public boolean isStreaming() {
        return isStreamingActive.get();
    }

    public String getCurrentStreamingScenario() {
        return currentStreamingScenario;
    }
}
