package com.fraudgraph.repository;

import com.fraudgraph.model.AlertStatus;
import com.fraudgraph.model.FraudAlert;
import com.fraudgraph.model.RiskPriority;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FraudAlertRepository extends JpaRepository<FraudAlert, Long> {
    Optional<FraudAlert> findByAlertReference(String alertReference);
    Optional<FraudAlert> findByTxnReference(String txnReference);

    Page<FraudAlert> findAllByOrderByCreatedAtDesc(Pageable pageable);

    List<FraudAlert> findByStatus(AlertStatus status);

    List<FraudAlert> findByPriority(RiskPriority priority);

    long countByStatus(AlertStatus status);

    @Query("SELECT a FROM FraudAlert a ORDER BY (a.riskScore * 0.6 + a.uncertaintyScore * 40.0) DESC")
    List<FraudAlert> findPrioritizedQueue(Pageable pageable);
}
