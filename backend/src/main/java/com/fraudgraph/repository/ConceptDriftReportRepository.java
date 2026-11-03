package com.fraudgraph.repository;

import com.fraudgraph.model.ConceptDriftReport;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConceptDriftReportRepository extends JpaRepository<ConceptDriftReport, Long> {
    List<ConceptDriftReport> findAllByOrderByTimestampDesc(Pageable pageable);

    @Query("SELECT r FROM ConceptDriftReport r ORDER BY r.timestamp DESC")
    List<ConceptDriftReport> findLatestReports(Pageable pageable);
}
