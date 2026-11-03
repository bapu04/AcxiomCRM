package com.fraudgraph.repository;

import com.fraudgraph.model.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {
    Optional<Account> findByAccountNumber(String accountNumber);
    List<Account> findByStatus(String status);
    List<Account> findByRiskTier(String riskTier);
    boolean existsByAccountNumber(String accountNumber);
}
