#!/usr/bin/env python3
"""
FraudGraph AI — Synthetic Financial Transaction & Concept Drift Generator
--------------------------------------------------------------------------
Generates realistic financial transaction streams with embedded fraud typologies
and controlled temporal concept drift for evaluating detection algorithms.

Typologies Generated:
1. Benign Baseline: Power-law transaction amounts ($10 - $500), standard velocities.
2. Circular Mule Layering (Graph Cycles): A -> B -> C -> A laundering rings.
3. Rapid Mule Fan-In / Accumulator: Multiple distinct senders depositing into single hub.
4. Velocity Smurfing Bursts: High-frequency sub-threshold transfers.
5. Concept Drift Phase: After time step T_drift, spending patterns and fraud vectors evolve.
"""

import csv
import math
import os
import random
import time
from datetime import datetime, timedelta

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
OUTPUT_CSV = os.path.join(DATA_DIR, "synthetic_transactions.csv")

ACCOUNTS = [f"ACC-{10000 + i}" for i in range(100)]
CHANNELS = ["MOBILE_APP", "WEB", "ATM", "WIRE", "POS"]
TXN_TYPES = ["TRANSFER", "PAYMENT", "CASH_OUT", "DEBIT"]
LOCATIONS = ["New York, US", "San Francisco, US", "London, UK", "Singapore, SG", "Toronto, CA", "Frankfurt, DE"]

def generate_dataset(num_records=5000, fraud_ratio=0.03, drift_start_idx=3500):
    os.makedirs(DATA_DIR, exist_ok=True)
    random.seed(42)

    base_time = datetime(2026, 10, 1, 8, 0, 0)
    records = []

    # Track account transaction timestamps for velocity
    account_history = {acc: [] for acc in ACCOUNTS}

    print(f"Generating {num_records} synthetic transactions with ~{fraud_ratio*100:.1f}% fraud rate...")
    print(f"Simulating Concept Drift starting at record {drift_start_idx}...")

    # Define dedicated mule ring accounts
    mule_ring = ["ACC-10020", "ACC-10021", "ACC-10022"]
    accumulator_mule = "ACC-10030"

    for i in range(num_records):
        is_drift_phase = i >= drift_start_idx
        is_fraud = random.random() < fraud_ratio

        # Advance timestamp
        time_delta_seconds = random.randint(5, 60)
        curr_time = base_time + timedelta(seconds=time_delta_seconds * i)

        if not is_fraud:
            # Benign retail transaction
            sender = random.choice(ACCOUNTS)
            recipient = random.choice(ACCOUNTS)
            while recipient == sender:
                recipient = random.choice(ACCOUNTS)

            # Amount follows log-normal distribution
            if not is_drift_phase:
                amount = round(random.lognormvariate(4.2, 0.7), 2)  # mean ~$80-$250
            else:
                # Concept drift shift: inflation / shifted merchant category spending
                amount = round(random.lognormvariate(4.8, 0.9), 2)  # mean ~$150-$400

            channel = random.choice(CHANNELS)
            location = random.choice(LOCATIONS)
            typology = "BENIGN"

        else:
            # Fraud typology selection
            fraud_type = random.choice(["CYCLE", "FAN_IN", "VELOCITY_BURST"])

            if fraud_type == "CYCLE":
                # Circular loop: A -> B -> C -> A
                step = i % len(mule_ring)
                sender = mule_ring[step]
                recipient = mule_ring[(step + 1) % len(mule_ring)]
                amount = round(random.uniform(4000.0, 9500.0), 2)
                channel = "WIRE"
                location = "London, UK"
                typology = "MULE_CIRCULAR_LOOP"

            elif fraud_type == "FAN_IN":
                # Multiple originators depositing into single accumulator
                sender = random.choice([acc for acc in ACCOUNTS if acc != accumulator_mule])
                recipient = accumulator_mule
                amount = round(random.uniform(1800.0, 4800.0), 2)
                channel = "WEB"
                location = "Zurich, CH"
                typology = "ACCUMULATOR_FAN_IN"

            else:
                # Velocity burst from compromised account
                sender = "ACC-10055"
                recipient = random.choice(ACCOUNTS)
                while recipient == sender:
                    recipient = random.choice(ACCOUNTS)
                amount = round(random.uniform(750.0, 1200.0), 2)
                channel = "MOBILE_APP"
                location = "Toronto, CA"
                typology = "VELOCITY_BURST"

        # Compute historical velocity in last 10 minutes
        window_start = curr_time - timedelta(minutes=10)
        recent_txns = [t for t in account_history[sender] if t >= window_start]
        velocity_10m = len(recent_txns) + 1
        account_history[sender].append(curr_time)

        # Record payload
        records.append({
            "txn_id": f"TXN-{100000 + i}",
            "timestamp": curr_time.isoformat(),
            "sender_account": sender,
            "recipient_account": recipient,
            "amount": amount,
            "channel": channel,
            "location": location,
            "velocity_10m": velocity_10m,
            "is_drift_phase": 1 if is_drift_phase else 0,
            "typology": typology,
            "is_fraud": 1 if is_fraud else 0,
        })

    # Write to CSV
    fieldnames = list(records[0].keys())
    with open(OUTPUT_CSV, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(records)

    fraud_count = sum(r["is_fraud"] for r in records)
    print(f"Generated {len(records)} records saved to {OUTPUT_CSV}")
    print(f"Total Fraud: {fraud_count} ({fraud_count/len(records)*100:.2f}%) | Normal: {len(records)-fraud_count}")
    return OUTPUT_CSV

if __name__ == "__main__":
    generate_dataset()
