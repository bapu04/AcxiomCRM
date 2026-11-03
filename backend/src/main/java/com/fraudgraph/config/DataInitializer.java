package com.fraudgraph.config;

import com.fraudgraph.dto.TransactionRequest;
import com.fraudgraph.model.Account;
import com.fraudgraph.model.TransactionType;
import com.fraudgraph.model.User;
import com.fraudgraph.repository.AccountRepository;
import com.fraudgraph.repository.UserRepository;
import com.fraudgraph.service.StreamingSimulatorService;
import com.fraudgraph.service.TransactionService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final TransactionService transactionService;

    public DataInitializer(UserRepository userRepository,
                           AccountRepository accountRepository,
                           PasswordEncoder passwordEncoder,
                           TransactionService transactionService) {
        this.userRepository = userRepository;
        this.accountRepository = accountRepository;
        this.passwordEncoder = passwordEncoder;
        this.transactionService = transactionService;
    }

    @Override
    public void run(String... args) {
        // 1. Seed Demo Users
        if (userRepository.count() == 0) {
            User investigator = new User(
                    "investigator",
                    "investigator@fraudgraph.internal",
                    passwordEncoder.encode("password123"),
                    "Sarah Chen, Senior Anti-Fraud Investigator",
                    "ROLE_INVESTIGATOR"
            );
            User admin = new User(
                    "admin",
                    "admin@fraudgraph.internal",
                    passwordEncoder.encode("admin123"),
                    "Marcus Vance, Head of Risk Operations",
                    "ROLE_ADMIN"
            );
            userRepository.saveAll(Arrays.asList(investigator, admin));
        }

        // 2. Seed Realistic Customer Accounts
        if (accountRepository.count() == 0) {
            List<Account> accounts = Arrays.asList(
                    new Account("ACC-10001", "Acme Retail Logistics", "billing@acmelogistics.com", "LOW", new BigDecimal("1200.00"), new BigDecimal("300.00"), 4),
                    new Account("ACC-10002", "Elena Rostova", "elena.rostova@gmail.com", "LOW", new BigDecimal("180.00"), new BigDecimal("45.00"), 1),
                    new Account("ACC-10003", "Apex Horizon Capital LLC", "transfers@apexhorizon.io", "HIGH", new BigDecimal("850.00"), new BigDecimal("220.00"), 3),
                    new Account("ACC-10004", "Devon Park Tech Hub", "devon.p@techhub.net", "MEDIUM", new BigDecimal("340.00"), new BigDecimal("90.00"), 2),
                    new Account("ACC-10005", "Global Pay Remittance", "ops@globalremit.com", "LOW", new BigDecimal("450.00"), new BigDecimal("110.00"), 5),
                    new Account("ACC-10006", "Clara Oswald", "clara.oswald@gmail.com", "LOW", new BigDecimal("120.00"), new BigDecimal("35.00"), 1),
                    new Account("ACC-10007", "Shell Entity Holding B.V.", "admin@shellholding.eu", "HIGH", new BigDecimal("750.00"), new BigDecimal("200.00"), 2),
                    new Account("ACC-10008", "David Kim", "dkim.freelance@outlook.com", "LOW", new BigDecimal("290.00"), new BigDecimal("70.00"), 2),
                    new Account("ACC-10009", "Nexus Rapid Liquidity", "routing@nexusliq.ch", "HIGH", new BigDecimal("600.00"), new BigDecimal("180.00"), 2),
                    new Account("ACC-10010", "Maya Patel", "maya.patel@designstudio.org", "LOW", new BigDecimal("210.00"), new BigDecimal("50.00"), 1)
            );
            accountRepository.saveAll(accounts);

            // 3. Seed Initial Realistic Transactions
            seedInitialTransactions();
        }
    }

    private void seedInitialTransactions() {
        // Normal baseline consumer transactions
        createTxn("ACC-10001", "ACC-10002", "145.50", "MOBILE_APP", "New York, US");
        createTxn("ACC-10002", "ACC-10006", "42.00", "POS", "New York, US");
        createTxn("ACC-10004", "ACC-10008", "210.00", "WEB", "San Francisco, US");
        createTxn("ACC-10008", "ACC-10010", "95.00", "MOBILE_APP", "Toronto, CA");
        createTxn("ACC-10005", "ACC-10001", "680.00", "WEB", "Singapore, SG");
        createTxn("ACC-10006", "ACC-10004", "110.00", "MOBILE_APP", "London, UK");

        // Seed a suspicious money laundering layering cycle (ACC-10003 -> ACC-10007 -> ACC-10009 -> ACC-10003)
        createTxn("ACC-10003", "ACC-10007", "4200.00", "WIRE", "London, UK");
        createTxn("ACC-10007", "ACC-10009", "4150.00", "WIRE", "Zurich, CH");
        createTxn("ACC-10009", "ACC-10003", "4100.00", "WIRE", "London, UK");

        // Seed an accumulator mule pattern (Fan-In: multiple senders to ACC-10007)
        createTxn("ACC-10001", "ACC-10007", "1850.00", "WEB", "Frankfurt, DE");
        createTxn("ACC-10004", "ACC-10007", "2300.00", "MOBILE_APP", "Frankfurt, DE");
    }

    private void createTxn(String src, String dst, String amt, String channel, String loc) {
        TransactionRequest req = new TransactionRequest();
        req.setSenderAccount(src);
        req.setRecipientAccount(dst);
        req.setAmount(new BigDecimal(amt));
        req.setType(TransactionType.TRANSFER);
        req.setChannel(channel);
        req.setLocation(loc);
        req.setIpAddress("198.51.100.22");
        transactionService.processTransaction(req);
    }
}
