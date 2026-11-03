# FraudGraph AI — Adaptive Financial Fraud Detection Under Concept Drift

[![Java](https://img.shields.io/badge/Java-17%20LTS-ED8B00?logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.4-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Spring Security](https://img.shields.io/badge/Spring%20Security-6.3-6DB33F?logo=springsecurity&logoColor=white)](https://spring.io/projects/spring-security)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Recharts](https://img.shields.io/badge/Recharts-2.12-22c55e)](https://recharts.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **FraudGraph AI** is a real-time FinTech transaction-monitoring platform designed to detect complex financial fraud topologies and explain risk indicators under **adversarial concept drift**. It combines **graph network analytics**, **behavioral deviation profiling**, and **model epistemic uncertainty** to prioritize human investigations and mitigate financial crime.

---

## 📑 Table of Contents
- [Executive Overview](#-executive-overview)
- [Novelty Directions](#-novelty-directions)
- [System Architecture](#-system-architecture)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Mathematical & Algorithmic Formulations](#-mathematical--algorithmic-formulations)
- [Getting Started & Installation](#-getting-started--installation)
- [Pre-Configured Demo Accounts](#-pre-configured-demo-accounts)
- [REST API Reference](#-rest-api-reference)
- [ML Research & Synthetic Dataset](#-ml-research--synthetic-dataset)
- [Compliance & Ethical Safeguards](#-compliance--ethical-safeguards)

---

## 💡 Executive Overview
Traditional anti-fraud systems rely on static rule thresholds (e.g. `amount > $10,000`) or stationary supervised classifiers. These systems fail when confronted with:
1. **Coordinated Mule Rings:** Fraudsters distribute funds across decentralized networks to evade single-entity monitoring.
2. **Concept Drift:** Fraudsters rapidly shift typologies (e.g., from high-value wires to high-frequency micro-payments).
3. **Investigation Fatigue:** High false-positive rates overwhelm compliance officers.

**FraudGraph AI** resolves these limitations through a hybrid architecture:
- **Transaction Relationships (Graph Analytics):** Identifies circular layering loops ($A \to B \to C \to A$) and accumulator mule clusters in real time.
- **Behavioral Changes:** Dynamically computes velocity bursts and spend $Z$-scores against account baselines.
- **Model Uncertainty:** Quantifies epistemic ambiguity near decision thresholds ($U = 1.0 - 2|P - 0.5|$) to prioritize high-value investigations for **Active Learning**.
- **Explainable AI (XAI):** Generates transparent, factor-by-factor risk breakdowns for compliance investigators.

---

## 🌟 Novelty Directions

```
                       ┌─────────────────────────┐
                       │   Incoming Transaction  │
                       └────────────┬────────────┘
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         ▼                          ▼                          ▼
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│  Graph Topology  │      │ Behavioral Drift │      │ Concept Drift    │
│  Analytics       │      │ Profiling        │      │ Detection        │
├──────────────────┤      ├──────────────────┤      ├──────────────────┤
│ • Cyclic Loops   │      │ • Velocity burst │      │ • Sliding window │
│ • Mule Fan-In    │      │ • Amount Z-score │      │   Page-Hinkley   │
│ • Mule Fan-Out   │      │ • Channel shift  │      │ • Baseline shift │
└────────┬─────────┘      └────────┬─────────┘      └────────┬─────────┘
         │                         │                         │
         └─────────────────────────┼─────────────────────────┘
                                   ▼
                   ┌───────────────────────────────┐
                   │ Adaptive Fraud Scoring Engine │
                   │  - Multi-factor Fusion        │
                   │  - Epistemic Uncertainty (U)  │
                   │  - Explainable AI (XAI) JSON  │
                   └───────────────┬───────────────┘
                                   │
         ┌─────────────────────────┴─────────────────────────┐
         ▼                                                   ▼
┌──────────────────────────────┐            ┌──────────────────────────────┐
│ Quadrant 1: High Risk/Low U  │            │ Quadrant 2: High Risk/High U │
│ ➔ Autonomous Block           │            │ ➔ Priority Investigator Case │
└──────────────────────────────┘            └──────────────────────────────┘
```

1. **Transaction Relationships (Graph Topology Engine):**
   - In-memory sliding-window directed multigraph.
   - Depth-bounded DFS cycle detection ($depth \le 4$) detecting smurfing & layering loops.
   - Bipartite and network degree analysis flagging accumulator mules (Fan-In $\ge 3$) and disperser mules (Fan-Out $\ge 3$).
2. **Behavioral Profiling & Velocity Drift:**
   - Real-time sliding window velocity counters (transactions per 10 minutes vs. historical hourly baselines).
   - Dynamic spend $Z$-score: $Z = \frac{\text{Amount} - \mu}{\sigma}$.
3. **Model Epistemic Uncertainty & Active Learning Prioritization:**
   - Instead of a naive binary risk score, each transaction computes both **Fraud Probability ($P$)** and **Uncertainty ($U$)**.
   - Cases are prioritized via:
     $$\text{Priority} = 0.6 \cdot \text{RiskScore} + 40.0 \cdot \text{Uncertainty}$$
   - This prioritizes boundary and drifted cases for human review, enabling rapid active learning retraining!
4. **Explainable AI (XAI) Attribution:**
   - Every flagged transaction produces an immutable JSON attribution list of contributing factors, severity ratings, and delta impact points for auditors.

---

## 🏛️ System Architecture

FraudGraph AI is built as a multi-tier, enterprise-grade FinTech application:

```
[ Web Browser / Investigator Terminal ]
                   │ (HTTP / REST / Axios with JWT)
                   ▼
┌────────────────────────────────────────────────────────┐
│ Presentation: Vite + React 18 + TailwindCSS + Recharts │
│  - Real-time Live Ingestion Stream Feed                │
│  - Interactive SVG FraudGraph Topology Visualizer      │
│  - Executive KPI Analytics Dashboard                   │
│  - Prioritized Investigation & Resolution Drawer       │
│  - Attack Simulation & Concept Drift Workbench         │
└──────────────────────────┬─────────────────────────────┘
                           │ (REST API / JSON / Port 8080)
                           ▼
┌────────────────────────────────────────────────────────┐
│ Backend: Java 17 + Spring Boot 3.3.4 + Spring Security │
│  - Stateless JWT Authentication Filter                 │
│  - GraphAnalyticsEngine (Cycle & Mule Detection)       │
│  - BehavioralProfilingEngine (Velocity & Z-Scores)     │
│  - ConceptDriftDetector (Statistical Distance Tracker) │
│  - UncertaintyEstimator (Epistemic Margin Calculus)    │
│  - StreamingSimulatorService (Synthetic Data Feeder)   │
└──────────────────────────┬─────────────────────────────┘
                           │ (Spring Data JPA / Hibernate)
                           ▼
┌────────────────────────────────────────────────────────┐
│ Persistence Layer: MySQL 8 (H2 in-memory dev fallback) │
│  - users, accounts, transactions, fraud_alerts,        │
│    concept_drift_reports                               │
└────────────────────────────────────────────────────────┘
```

---

## 🚀 Key Features

### 1. 📊 Executive Fraud Intelligence Dashboard
- Real-time KPI summary widgets (Monitored Volume, Flagged Fraud Rate %, Concept Drift Index, Detection Latency).
- **Recharts** interactive data visualizations:
  - *Streaming Transaction Velocity & Risk Density* (Area chart).
  - *Investigation Priority Queue Breakdown* (Bar chart).
  - *Adaptive Concept Drift Tracker* (Line chart with dynamic threshold reference).
  - *Uncertainty Decision Matrix* (Interactive 4-quadrant display).

### 2. ⚡ Live Transaction Stream & Ingestion Monitor
- Real-time transaction feed with sub-second scoring updates.
- Real-time status badges (`APPROVED`, `UNDER_REVIEW`, `BLOCKED`).
- Multidimensional filtering by Status, Search Keyword, and Min Risk Score threshold.
- 1-click synthetic transaction injection button for live testing.

### 3. 🕸️ FraudGraph Topology & Mule Ring Visualizer
- Interactive SVG network graph displaying account nodes and transaction flow vectors.
- Dynamic detection of **circular money laundering loops** highlighted in glowing red.
- Detection of **accumulator mules** (Fan-In) and **disperser mules** (Fan-Out) marked in warning amber.
- Account inspector drawer displaying in-degree, out-degree, and risk contagion status.

### 4. 🚨 Case Management & Explainable AI (XAI) Modal
- Priority-ranked investigation queue fusing risk severity with model uncertainty.
- XAI Waterfall displaying factor attribution (+35 pts Circular Cycle, +30 pts Velocity Burst, etc.).
- Complete case resolution lifecycle: `OPEN`, `INVESTIGATING`, `CONFIRMED_FRAUD`, `FALSE_POSITIVE`, `DISMISSED`.
- Immutable append-only audit trail with investigator timestamped notes.

### 5. 🧪 Attack Simulation & Concept Drift Lab
- Interactive simulator to stress-test the detection pipeline against real-world FinTech attacks:
  - **Circular Mule Ring Attack:** Injects 3-way circular layering loops.
  - **Velocity Burst Smurfing:** Floods 6 transfers in under 10 seconds.
  - **Concept Drift Shift:** Injects sudden high-value transfer drift ($9k - $25k).
  - **Benign Baseline Stream:** Generates standard retail consumer transactions.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite 5, Tailwind CSS 3, Recharts 2.12, Lucide Icons, Axios |
| **Backend** | Java 17 LTS, Spring Boot 3.3.4, Spring Security 6, JJWT 0.12.6, Spring Data JPA, Hibernate |
| **Database** | MySQL 8 (Production profile) / H2 in-memory (Default dev profile) |
| **Security** | Stateless JWT Authentication, BCrypt password hashing, Role-Based Access Control |
| **AI / ML Research** | Python 3, scikit-learn, Cost-Sensitive Learning, ADWIN Drift Modeling |
| **Development** | VS Code, Maven 3.9, Git, GitHub |

---

## 🧮 Mathematical & Algorithmic Formulations

### 1. Spend Deviation $Z$-Score
$$Z = \frac{\text{Amount} - \mu_{\text{baseline}}}{\sigma_{\text{baseline}}}$$
When $Z > 3.0$, the transaction is classified as an anomalous spend deviation ($p < 0.0013$).

### 2. Model Epistemic Uncertainty Formulation
$$U = \max\left(0.02, \min\left(0.98, \left(1.0 - 2 \cdot |P - 0.5|\right) \cdot 0.55 + \delta_{\text{conflict}} + 0.25 \cdot D_{\text{drift}}\right)\right)$$
- When $P = 0.50$ (decision boundary), uncertainty reaches maximum.
- Conflicting signals (e.g. benign behavioral spend but participation in a cyclic graph loop) add a dissonance penalty $\delta_{\text{conflict}} = 0.20$.
- Concept drift increases epistemic uncertainty by $0.25 \cdot D_{\text{drift}}$.

### 3. Case Prioritization Score
$$\text{PriorityScore} = 0.60 \cdot \text{RiskScore} + 40.0 \cdot U$$
Ensures investigators prioritize transactions that are both high-risk and near the model's ambiguity boundary for **Active Learning**.

---

## 🏁 Getting Started & Installation

### Prerequisites
- **Java 17 LTS** or higher
- **Node.js 18+** and **npm**
- **Maven 3.8+** (or use system maven)
- *(Optional)* **MySQL 8.0+** (if running against local MySQL)

---

### Step 1: Clone Repository
```bash
git clone https://github.com/bapu04/AcxiomCRM.git
cd AcxiomCRM
```

---

### Step 2: Start Spring Boot Backend
The backend runs by default in `dev` profile using in-memory H2 with zero database installation required!

```bash
cd backend
mvn clean spring-boot:run
```
*The backend starts at `http://localhost:8080`.*
*(Optional) H2 Console is available at `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:fraudgraph_db`, user: `sa`, password: empty).*

#### Running with MySQL (Optional)
To use local MySQL:
1. Ensure MySQL is running on port 3306.
2. Execute the DDL script:
   ```bash
   mysql -u root -p < src/main/resources/schema-mysql.sql
   ```
3. Run with the MySQL profile:
   ```bash
   mvn spring-boot:run -Dspring-boot.run.profiles=mysql
   ```

---

### Step 3: Start React Frontend
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
*The frontend dashboard will be live at `http://localhost:5173`.*

---

## 👤 Pre-Configured Demo Accounts

For instant evaluation, 1-click login buttons are provided on the login page:

| Role | Username | Password | Access Capabilities |
|---|---|---|---|
| **Senior Fraud Investigator** | `investigator` | `password123` | Full access to Stream, Case Resolutions, XAI Drawer, and Graph Explorer |
| **Risk Operations Admin** | `admin` | `admin123` | Full system oversight, Simulator Workbench, and Audit History |

---

## 📡 REST API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Authenticate with credentials and receive JWT |
| `POST` | `/api/auth/register` | Register an investigator account |
| `GET` | `/api/auth/me` | Retrieve active authenticated session |

### Transactions (`/api/transactions`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/transactions` | Score and ingest a transaction in real time |
| `GET` | `/api/transactions` | Paginated recent transaction ledger |
| `GET` | `/api/transactions/recent` | Top 50 streaming transactions |
| `GET` | `/api/transactions/{ref}` | Get transaction details with XAI breakdown |

### Investigation Alerts (`/api/alerts`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/alerts` | Paginated investigation cases |
| `GET` | `/api/alerts/prioritized` | Active queue prioritized by Risk + Uncertainty |
| `GET` | `/api/alerts/{ref}` | Alert detail view |
| `PATCH` | `/api/alerts/{ref}/resolve` | Resolve alert with investigator audit notes |

### Graph & Analytics (`/api/graph`, `/api/analytics`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/graph/topology` | Returns graph nodes, edges, cycles, and mules |
| `GET` | `/api/analytics/summary` | KPI executive metrics summary |
| `GET` | `/api/analytics/drift-reports`| Recent concept drift detection events |

### Simulator & Drift Lab (`/api/simulation`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/simulation/batch` | Ingest scenario (`MULE_ATTACK`, `VELOCITY_BURST`, `HIGH_AMOUNT_DRIFT`) |
| `POST` | `/api/simulation/single` | Emit single realistic normal transaction |
| `POST` | `/api/simulation/toggle` | Start/stop continuous background transaction stream |
| `GET` | `/api/simulation/status` | Get background streaming status |

---

## 🧪 ML Research & Synthetic Dataset

A dedicated Python research suite is located in `/ml-research`:

- `generate_synthetic_dataset.py`: Generates 5,000 synthetic financial transactions with log-normal spend, mule ring cycles, and temporal concept drift.
- `train_adaptive_model.py`: Implements benchmark evaluation under extreme class imbalance, extracting graph centrality, calculating PR-AUC, and evaluating performance across drift boundaries.
- `concept_drift_experiment.py`: Runs sliding window distribution shift tests tracking drift distance and trigger points.

Run the research suite:
```bash
python3 ml-research/generate_synthetic_dataset.py
python3 ml-research/train_adaptive_model.py
python3 ml-research/concept_drift_experiment.py
```

---

## 🛡️ Compliance & Ethical Safeguards

- **Synthetic Data Standard:** FraudGraph AI strictly uses synthetic and public mathematical distributions (PaySim-style log-normal amounts, pseudo-random account identifiers). **Zero real banking credentials or unauthorized financial records are used.**
- **Explainability (XAI) Compliance:** Designed in compliance with regulatory Explainable AI standards (such as GDPR Article 22 Right to Explanation and US FCRA model auditability), ensuring that every blocked transaction has deterministic, human-auditable factor justifications.

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
