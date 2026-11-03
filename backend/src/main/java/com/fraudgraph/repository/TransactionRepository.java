package com.fraudgraph.repository;

import com.fraudgraph.model.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    Optional<Transaction> findByTxnReference(String txnReference);

    Page<Transaction> findAllByOrderByTimestampDesc(Pageable pageable);

    List<Transaction> findTop50ByOrderByTimestampDesc();

    @Query("SELECT t FROM Transaction t WHERE t.senderAccount = :acc OR t.recipientAccount = :acc ORDER BY t.timestamp DESC")
    List<Transaction> findRecentByAccount(@Param("acc") String account, Pageable pageable);

    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.senderAccount = :account AND t.timestamp >= :since")
    long countBySenderSince(@Param("account") String account, @Param("since") LocalDateTime since);

    @Query("SELECT t FROM Transaction t WHERE t.timestamp >= :since ORDER BY t.timestamp ASC")
    List<Transaction> findTransactionsSince(@Param("since") LocalDateTime since);

    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.status = 'BLOCKED' OR t.status = 'UNDER_REVIEW'")
    long countFlaggedTransactions();

    @Query("SELECT COUNT(t) FROM Transaction t")
    long countTotalTransactions();
}
