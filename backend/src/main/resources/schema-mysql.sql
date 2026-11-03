-- FraudGraph AI Database Schema Definition for MySQL
-- Supports high-throughput indexing for real-time transaction scoring and graph queries

CREATE DATABASE IF NOT EXISTS fraudgraph_db;
USE fraudgraph_db;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(64) NOT NULL UNIQUE,
    email VARCHAR(128) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(128) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'ROLE_INVESTIGATOR',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS accounts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    account_number VARCHAR(64) NOT NULL UNIQUE,
    holder_name VARCHAR(128) NOT NULL,
    email VARCHAR(128),
    risk_tier VARCHAR(16) NOT NULL DEFAULT 'LOW',
    status VARCHAR(16) NOT NULL DEFAULT 'ACTIVE',
    baseline_avg_amount DECIMAL(15,2) DEFAULT 250.00,
    baseline_std_dev_amount DECIMAL(15,2) DEFAULT 80.00,
    baseline_velocity_per_hr INT DEFAULT 2,
    country VARCHAR(8) DEFAULT 'US',
    ip_subnet VARCHAR(32),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_acc_number (account_number),
    INDEX idx_acc_status (status)
);

CREATE TABLE IF NOT EXISTS transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    txn_reference VARCHAR(64) NOT NULL UNIQUE,
    sender_account VARCHAR(64) NOT NULL,
    recipient_account VARCHAR(64) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(8) DEFAULT 'USD',
    type VARCHAR(32) NOT NULL,
    channel VARCHAR(32) NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    location VARCHAR(64),
    status VARCHAR(32) NOT NULL,
    risk_score INT NOT NULL,
    uncertainty_score DECIMAL(5,4) NOT NULL,
    drift_deviation DECIMAL(5,4) NOT NULL,
    is_fraud_candidate BOOLEAN NOT NULL DEFAULT FALSE,
    xai_factors_json TEXT,
    INDEX idx_txn_sender (sender_account),
    INDEX idx_txn_recipient (recipient_account),
    INDEX idx_txn_timestamp (timestamp),
    INDEX idx_txn_risk (risk_score),
    INDEX idx_txn_status (status)
);

CREATE TABLE IF NOT EXISTS fraud_alerts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    alert_reference VARCHAR(64) NOT NULL UNIQUE,
    txn_reference VARCHAR(64) NOT NULL,
    sender_account VARCHAR(64) NOT NULL,
    recipient_account VARCHAR(64) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    risk_score INT NOT NULL,
    priority VARCHAR(16) NOT NULL,
    uncertainty_score DECIMAL(5,4) NOT NULL,
    drift_deviation DECIMAL(5,4) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'OPEN',
    primary_reason VARCHAR(255) NOT NULL,
    xai_factors_json TEXT,
    investigator_notes TEXT,
    assigned_to VARCHAR(64),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_alert_status (status),
    INDEX idx_alert_priority (priority),
    INDEX idx_alert_txn (txn_reference)
);

CREATE TABLE IF NOT EXISTS concept_drift_reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    window_size INT NOT NULL,
    detected_drift BOOLEAN NOT NULL,
    drift_score DECIMAL(5,4) NOT NULL,
    mean_amount_baseline DECIMAL(15,2),
    mean_amount_current DECIMAL(15,2),
    velocity_baseline DECIMAL(8,2),
    velocity_current DECIMAL(8,2),
    p_value_or_distance DECIMAL(6,4),
    flagged_patterns_json TEXT,
    notes TEXT
);
