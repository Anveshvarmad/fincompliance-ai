# FinCompliance AI

> **AI-assisted financial compliance intelligence with deterministic risk scoring, semantic policy retrieval, explainable AI, reliable event delivery, and cloud-native orchestration.**

FinCompliance AI is a full-stack financial compliance intelligence platform that demonstrates how modern backend systems, deterministic decision engines, vector search, generative AI, event-driven architecture, observability, security, and Kubernetes can operate together as one cohesive system.

The platform processes financial transactions, evaluates them through a deterministic compliance engine, retrieves relevant policy context from a vector database, produces grounded AI explanations for analysts, records operational events asynchronously, and exposes the complete workflow through an interactive React dashboard.

---

# Table of Contents

- [1. What FinCompliance AI Does](#1-what-fincompliance-ai-does)
- [2. Core Design Principles](#2-core-design-principles)
- [3. High-Level Architecture](#3-high-level-architecture)
- [4. End-to-End Transaction Journey](#4-end-to-end-transaction-journey)
- [5. Deterministic Risk Engine](#5-deterministic-risk-engine)
- [6. Semantic Compliance Knowledge Base](#6-semantic-compliance-knowledge-base)
- [7. Retrieval-Augmented AI Explanation](#7-retrieval-augmented-ai-explanation)
- [8. Transactional Outbox and Event Architecture](#8-transactional-outbox-and-event-architecture)
- [9. Audit Trail](#9-audit-trail)
- [10. Authentication and RBAC](#10-authentication-and-rbac)
- [11. Frontend Workspaces](#11-frontend-workspaces)
- [12. Storage Architecture](#12-storage-architecture)
- [13. Backend Architecture](#13-backend-architecture)
- [14. Observability and API Hardening](#14-observability-and-api-hardening)
- [15. Resilience and Failure Handling](#15-resilience-and-failure-handling)
- [16. Testing and Performance Engineering](#16-testing-and-performance-engineering)
- [17. Docker Architecture](#17-docker-architecture)
- [18. Kubernetes Architecture](#18-kubernetes-architecture)
- [19. CI/CD and Release Engineering](#19-cicd-and-release-engineering)
- [20. Technology Stack](#20-technology-stack)
- [21. Repository Structure](#21-repository-structure)
- [22. API Overview](#22-api-overview)
- [23. Local Development](#23-local-development)
- [24. Kubernetes Deployment](#24-kubernetes-deployment)
- [25. Engineering Trade-Offs](#25-engineering-trade-offs)
- [26. Project Scope and Disclaimer](#26-project-scope-and-disclaimer)

---

# 1. What FinCompliance AI Does

FinCompliance AI models the workflow of a financial-compliance investigation system.

At a high level:

```text
Financial Transaction
        |
        v
Transaction Processing
        |
        v
Deterministic Risk Analysis
        |
        +----------------------------+
        |                            |
        v                            v
Triggered Rules              Compliance Policies
        |                            |
        |                     Semantic Retrieval
        |                            |
        +-------------+--------------+
                      |
                      v
              Grounded AI Explanation
                      |
                      v
                 Analyst UI
                      |
                      v
                  Audit Trail
```

The application supports:

- financial transaction ingestion
- customer and transaction management
- deterministic compliance scoring
- explainable rule matches
- semantic policy retrieval
- Retrieval-Augmented Generation
- grounded AI explanations
- asynchronous audit-event processing
- JWT authentication
- role-based access control
- structured JSON logging
- request tracing
- API rate limiting
- automated testing
- latency benchmarking
- Docker deployment
- Kubernetes orchestration
- CI/CD with GitHub Actions

---

# 2. Core Design Principles

## 2.1 Deterministic Decisions, Generative Explanations

The most important architectural rule is:

```text
Rules decide risk.
AI explains risk.
```

The LLM never owns the authoritative compliance score.

```text
Transaction
     |
     v
Deterministic Rules
     |
     v
Locked Risk Score
     |
     +-------------------------+
     |                         |
     v                         v
Rule Matches             Policy Retrieval
     |                         |
     +------------+------------+
                  |
                  v
            Generative AI
                  |
                  v
         Human-Readable Explanation
```

This keeps compliance scoring:

- predictable
- reproducible
- testable
- auditable
- independent from LLM variability

---

## 2.2 Storage by Workload

Each storage technology has a specific responsibility.

```text
                 Application Data
                        |
        +---------------+---------------+
        |               |               |
        v               v               v
   PostgreSQL        MongoDB         ChromaDB
        |               |               |
 Structured state   Audit events    Vector search
 Transactions       Flexible docs   Policy chunks
 Risk results       Event payloads  Embeddings
 AI results
 Outbox events
```

---

## 2.3 Reliable Event Delivery

Audit events are not sent directly after a database commit.

Instead:

```text
Business Write
      |
      v
PostgreSQL Transaction
      |
      +--------------------+
      |                    |
      v                    v
Business Row          Outbox Row
      |                    |
      +---------+----------+
                |
              COMMIT
                |
                v
          Outbox Worker
                |
                v
            RabbitMQ
                |
                v
        Node.js Consumer
                |
                v
             MongoDB
```

---

## 2.4 Idempotent Processing

Repeated requests should not create duplicate business results.

```text
Analyze Transaction
       |
       v
Assessment Exists?
    /       \
  YES        NO
   |          |
   v          v
Return      Calculate
Existing    Assessment
Result         |
              v
             Save
```

Audit-event deduplication uses a unique `event_id`.

---

# 3. High-Level Architecture

```text
                           ┌─────────────────────┐
                           │       React         │
                           │ Financial Intel UI  │
                           └──────────┬──────────┘
                                      │
                                      │ HTTP / JWT
                                      ▼
                           ┌─────────────────────┐
                           │       FastAPI       │
                           │    Core Backend     │
                           └──────┬────┬────┬────┘
                                  │    │    │
                ┌─────────────────┘    │    └─────────────────┐
                │                      │                      │
                ▼                      ▼                      ▼
       ┌────────────────┐     ┌────────────────┐    ┌────────────────┐
       │   PostgreSQL   │     │    ChromaDB    │    │     Ollama     │
       │                │     │                │    │                │
       │ Transactions   │     │ Policy chunks  │    │ EmbeddingGemma │
       │ Customers      │     │ Vector search  │    │ Gemma 3        │
       │ Risk Results   │     │                │    │                │
       │ AI Results     │     └────────────────┘    └────────────────┘
       │ Outbox         │
       └───────┬────────┘
               │
               ▼
       ┌────────────────┐
       │ Outbox Workers │
       └───────┬────────┘
               │
               ▼
       ┌────────────────┐
       │    RabbitMQ    │
       └───────┬────────┘
               │
               ▼
       ┌────────────────┐
       │ Node.js Event  │
       │    Consumer    │
       └───────┬────────┘
               │
               ▼
       ┌────────────────┐
       │    MongoDB     │
       │  Audit Events  │
       └────────────────┘
```

---

# 4. End-to-End Transaction Journey

A transaction can move through the complete system as follows:

```text
1. Transaction Created
          |
          v
2. Stored in PostgreSQL
          |
          v
3. Deterministic Rules Evaluated
          |
          v
4. Risk Score + Risk Level Generated
          |
          v
5. Rule Matches Stored
          |
          v
6. Semantic Query Created
          |
          v
7. Embedding Generated
          |
          v
8. Relevant Policies Retrieved from ChromaDB
          |
          v
9. Risk + Rules + Policies Sent to Gemma
          |
          v
10. Grounded Explanation Generated
          |
          v
11. Explanation Stored in PostgreSQL
          |
          v
12. Outbox Events Published Through RabbitMQ
          |
          v
13. Node Consumer Stores Events in MongoDB
          |
          v
14. React Dashboard Displays Investigation + Audit History
```

---

# 5. Deterministic Risk Engine

Compliance risk is calculated using explicit rules.

Example rule categories:

- high-value transactions
- very-high-value transactions
- cross-border activity
- wire transfers
- large cash withdrawals
- customer geographic inconsistencies

---

## Risk Scoring Flow

```text
Transaction
     |
     v
Load Customer
     |
     v
Evaluate Rule Set
     |
     +----------------------------+
     |             |              |
     v             v              v
High Value    Cross Border      Wire
   +30            +20           +15
     |             |              |
     +-------------+--------------+
                   |
                   v
             Sum Contributions
                   |
                   v
              Clamp to 100
                   |
                   v
              Risk Level
```

---

## Example

```text
Transaction Amount:     $22,500
Origin Country:         US
Destination Country:    SG
Transaction Type:       Wire Transfer


HIGH_VALUE              +30
CROSS_BORDER            +20
WIRE_TRANSFER           +15
--------------------------------
TOTAL                    65

RISK LEVEL               HIGH
```

---

## Risk Thresholds

```text
Score
  |
  |  75 ─────────────────── CRITICAL
  |
  |  50 ─────────────────── HIGH
  |
  |  25 ─────────────────── MEDIUM
  |
  |   0 ─────────────────── LOW
  |
```

Equivalent ranges:

```text
0  - 24     LOW
25 - 49     MEDIUM
50 - 74     HIGH
75 - 100    CRITICAL
```

---

## Assessment Persistence

```text
POST /analyze
      |
      v
Search Existing Assessment
      |
      +----------+
      |          |
    FOUND      MISSING
      |          |
      v          v
 Return       Execute
 Existing     Risk Rules
      |          |
      |          v
      |        Save
      |          |
      +-----> Response
```

---

# 6. Semantic Compliance Knowledge Base

The project includes synthetic compliance-policy documents.

Example categories:

- High-Value Transaction Review
- Cross-Border Transaction Review
- Wire Transfer Monitoring
- Large Cash Withdrawal Review
- Customer Geographic Consistency
- Transaction Velocity Monitoring
- Customer Identity and Profile Review
- Risk Escalation and Manual Review

---

## Policy Ingestion Pipeline

```text
Compliance Policy Documents
           |
           v
       Load JSON
           |
           v
       Text Chunking
           |
           v
     EmbeddingGemma
           |
           v
     Vector Embeddings
           |
           v
        ChromaDB
           |
           v
     Vector Collection
```

---

## Semantic Search

```text
User Query
   |
   v
"large international wire transfer"
   |
   v
EmbeddingGemma
   |
   v
Query Vector
   |
   v
ChromaDB Similarity Search
   |
   v
Top-K Policy Chunks
   |
   v
Ranked Results
```

Search results contain:

- rank
- policy ID
- policy title
- category
- chunk ID
- text
- vector distance

> Vector distance represents semantic proximity. It is not a compliance-confidence score.

---

# 7. Retrieval-Augmented AI Explanation

FinCompliance AI uses Retrieval-Augmented Generation to explain deterministic results.

---

## Complete RAG Flow

```text
Transaction
    |
    v
Deterministic Assessment
    |
    +--------------------------+
    |                          |
    v                          v
Risk Score                 Triggered Rules
    |                          |
    +-------------+------------+
                  |
                  v
          Build Semantic Query
                  |
                  v
           EmbeddingGemma
                  |
                  v
              ChromaDB
                  |
                  v
       Relevant Policy Chunks
                  |
                  v
        Prompt Construction
                  |
       +----------+----------+
       |                     |
       v                     v
Fixed Risk Context       Policy Context
       |                     |
       +----------+----------+
                  |
                  v
               Gemma 3
                  |
                  v
         Structured JSON Output
                  |
       +----------+-----------+
       |          |           |
       v          v           v
    Summary    Rationale    Action
```

---

## AI Output

The generated explanation contains:

```text
AI Explanation
     |
     +--> Summary
     |
     +--> Rationale
     |
     +--> Recommended Action
     |
     +--> Supporting Policy Sources
     |
     +--> Model Name
     |
     +--> Prompt Version
```

The AI does not recalculate:

- risk score
- risk level
- rule contributions

Those remain owned by the deterministic engine.

---

# 8. Transactional Outbox and Event Architecture

## The Dual-Write Problem

A naive architecture might perform:

```text
Step 1
Commit Business Transaction
        |
        v
Step 2
Publish Event
        |
        v
Event Service
```

If Step 1 succeeds and Step 2 fails:

```text
PostgreSQL                Audit System
     |                         |
     v                         v
Transaction EXISTS        Event MISSING
```

The systems become inconsistent.

---

## Transactional Outbox Solution

```text
BEGIN TRANSACTION
        |
        +---------------------------+
        |                           |
        v                           v
Insert Business Data        Insert Outbox Event
        |                           |
        +-------------+-------------+
                      |
                    COMMIT
                      |
                      v
              Both Persisted
```

Then asynchronously:

```text
Outbox Table
    |
    v
Pending Event
    |
    v
Outbox Worker
    |
    v
RabbitMQ
    |
    v
Node Consumer
    |
    v
MongoDB
```

---

## Outbox Worker Concurrency

Multiple workers can safely process the queue.

```text
                  PostgreSQL Outbox
                         |
             +-----------+-----------+
             |                       |
             v                       v
         Worker A                 Worker B
             |                       |
      Row 101 locked           Row 102 locked
             |                       |
             +-----------+-----------+
                         |
                FOR UPDATE
                SKIP LOCKED
```

This avoids workers claiming the same row simultaneously.

---

## Delivery Model

```text
Transactional Outbox
        +
RabbitMQ Durable Queue
        +
Manual Acknowledgment
        +
MongoDB Unique event_id
        =
At-Least-Once Delivery
with Idempotent Consumption
```

---

# 9. Audit Trail

Operational events include:

```text
TRANSACTION_CREATED
        |
        v
RISK_ASSESSMENT_CREATED
        |
        v
AI_EXPLANATION_CREATED
```

---

## Audit Event Journey

```text
FastAPI Business Operation
          |
          v
PostgreSQL Outbox
          |
          v
Outbox Publisher
          |
          v
RabbitMQ Queue
          |
          v
Node.js Consumer
          |
          v
MongoDB audit_events
          |
          v
React Audit Workspace
```

---

## Audit Event Structure

```text
Audit Event
   |
   +--> event_id
   |
   +--> event_type
   |
   +--> transaction_ref
   |
   +--> source
   |
   +--> occurred_at
   |
   +--> received_at
   |
   +--> payload
```

MongoDB creates indexes for:

```text
event_id
    |
    +--> UNIQUE

transaction_ref + occurred_at

event_type + occurred_at
```

---

# 10. Authentication and RBAC

The application uses JWT authentication.

---

## Authentication Flow

```text
User
 |
 v
Login Form
 |
 v
POST /api/v1/auth/login
 |
 v
Verify PBKDF2 Password Hash
 |
 v
Generate Signed JWT
 |
 v
React Stores Token
 |
 v
Authorization: Bearer <token>
 |
 v
FastAPI
 |
 v
Validate JWT
 |
 v
RBAC Check
 |
 v
Protected Endpoint
```

---

## Role Hierarchy

```text
ADMIN
  |
  v
ANALYST
  |
  v
VIEWER
```

### Viewer

```text
Viewer
  |
  +--> Dashboard
  +--> Transactions
  +--> Knowledge Search
  +--> Read Operations
```

### Analyst

```text
Analyst
  |
  +--> All Viewer Permissions
  +--> Run Risk Analysis
  +--> Generate AI Explanation
```

### Admin

```text
Admin
  |
  +--> All Analyst Permissions
  +--> Privileged Administrative Operations
```

---

## Password Handling

```text
Plain Password
      |
      v
Random Salt
      |
      v
PBKDF2-HMAC-SHA256
      |
      v
Password Hash
      |
      v
Environment Configuration
```

Plaintext application passwords are not stored in the repository.

---

# 11. Frontend Workspaces

The frontend uses React, Vite, React Router, Framer Motion, Recharts, and Lucide React.

The UI follows a dark financial-intelligence design language.

---

## Application Navigation

```text
Login
  |
  v
Overview
  |
  +--> Transactions
  |       |
  |       v
  |   Investigation
  |
  +--> Risk
  |
  +--> Knowledge
  |
  +--> AI Intelligence
  |
  +--> Audit Trail
```

---

## Overview Command Center

Displays:

```text
Overview
   |
   +--> Total Transactions
   |
   +--> Customers
   |
   +--> Risk Assessments
   |
   +--> High / Critical Risk
   |
   +--> AI Explanations
   |
   +--> Average Risk Score
   |
   +--> Risk Distribution
   |
   +--> Assessment Coverage
   |
   +--> AI Coverage
   |
   +--> Audit Events
   |
   +--> Recent Transactions
   |
   +--> Service Health
```

---

## Transaction Explorer

```text
Transaction Database
       |
       v
Pagination + Filters
       |
       v
Transaction Table
       |
       v
Select Transaction
       |
       v
Investigation Page
```

---

## Transaction Investigation

```text
Selected Transaction
        |
        +---------------------+
        |                     |
        v                     v
Transaction Details      Risk Assessment
                              |
                    +---------+---------+
                    |                   |
                    v                   v
                Risk Score          Rule Matches
```

---

## Knowledge Workspace

```text
Natural-Language Query
         |
         v
      Search
         |
         v
Semantic Results
         |
         v
Policy Inspector
```

---

## AI Workspace

```text
Select Transaction
       |
       v
Assessment Exists?
    /       \
  NO         YES
  |           |
  v           v
Run Rules   Load Assessment
               |
               v
       Explanation Exists?
          /          \
        NO            YES
        |              |
        v              v
 Generate RAG      Display Result
 Explanation
```

---

## Audit Workspace

```text
MongoDB Events
      |
      v
Event Timeline
      |
      +--> Search Transaction
      |
      +--> Filter Event Type
      |
      v
Select Event
      |
      v
Payload Inspector
```

---

# 12. Storage Architecture

## PostgreSQL

Stores authoritative structured application state.

```text
PostgreSQL
   |
   +--> Customers
   |
   +--> Transactions
   |
   +--> Risk Assessments
   |
   +--> Rule Matches
   |
   +--> AI Explanations
   |
   +--> Outbox Events
```

---

## MongoDB

Stores flexible operational event documents.

```text
MongoDB
   |
   └── audit_events
         |
         +--> Transaction Events
         +--> Risk Events
         +--> AI Events
```

---

## ChromaDB

Stores vectorized compliance-policy knowledge.

```text
ChromaDB
   |
   └── Compliance Collection
         |
         +--> Embedding Vector
         +--> Policy ID
         +--> Title
         +--> Category
         +--> Chunk Index
         +--> Text
```

---

## RabbitMQ

Transports asynchronous audit events.

```text
Publisher
   |
   v
compliance.audit.events
   |
   v
Consumer
```

---

# 13. Backend Architecture

The FastAPI backend follows layered responsibilities.

```text
HTTP Request
     |
     v
API Router
     |
     v
Service Layer
     |
     v
Repository / Client Layer
     |
     +-----------------------+
     |           |           |
     v           v           v
 PostgreSQL   ChromaDB     Ollama
```

Representative structure:

```text
backend/app/
|
├── api/
├── clients/
├── data/
├── knowledge/
├── repositories/
├── schemas/
├── scripts/
├── services/
├── workers/
├── db.py
├── hardening.py
├── logging_config.py
├── main.py
├── models.py
├── security.py
└── settings.py
```

---

# 14. Observability and API Hardening

## Request Flow

```text
HTTP Request
     |
     v
Request ID
     |
     v
Rate Limiter
     |
     v
JWT / RBAC
     |
     v
Validation
     |
     v
Business Logic
     |
     v
Response
     |
     v
Security Headers
     |
     v
Structured JSON Log
```

---

## Request IDs

Every request receives:

```text
X-Request-ID
```

Clients can supply their own request ID, or the server generates one.

---

## Structured Logging

Example:

```json
{
  "timestamp": "2026-09-16T20:30:00Z",
  "level": "INFO",
  "logger": "fincompliance.request",
  "message": "HTTP request completed",
  "request_id": "42a809...",
  "method": "GET",
  "path": "/api/v1/transactions",
  "status_code": 200,
  "duration_ms": 12.7
}
```

---

## Security Headers

Responses include headers such as:

```text
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: no-referrer
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

---

## Rate Limiting

```text
Client
  |
  v
Request Bucket
  |
  +---- Below Limit ----> Continue
  |
  └---- Limit Reached --> HTTP 429
```

---

## External Request Resilience

```text
External Request
      |
      v
Attempt 1
      |
   Failed?
    /   \
  NO     YES
  |       |
  v       v
Return   Backoff
           |
           v
        Attempt 2
           |
          ...
```

Retryable responses include:

```text
429
500
502
503
504
```

---

# 15. Resilience and Failure Handling

## RabbitMQ Failure

```text
Business Transaction
        |
        v
PostgreSQL Commit
        |
        v
Outbox Row Remains Pending
        |
   RabbitMQ Down
        |
        X
        |
 RabbitMQ Recovers
        |
        v
Worker Retries
        |
        v
Event Published
```

---

## MongoDB Failure

```text
RabbitMQ
   |
   v
Consumer
   |
MongoDB Down
   |
   X
   |
Message NOT acknowledged
   |
MongoDB Recovers
   |
   v
Message Retried
```

---

## Duplicate Delivery

```text
RabbitMQ Event
     |
     v
MongoDB Insert
     |
 event_id Exists?
    /       \
  YES        NO
   |          |
   v          v
Ignore      Insert
Duplicate   Event
```

---

## Ollama Failure

```text
Core Transactions          AI Services
       |                        |
       v                        v
 Continue Working        Temporarily Unavailable
       |
       v
Risk Engine Still Works
```

---

## ChromaDB Failure

```text
Transaction Processing      Semantic Search
        |                        |
        v                        v
     Available               Unavailable
                                 |
                                 v
                      RAG Explanation Impacted
```

---

## Backend Pod Failure

```text
              Kubernetes Service
                     |
          +----------+----------+
          |                     |
          v                     v
     Backend Pod A         Backend Pod B
          |
       Failure
          |
          X
          |
Readiness Probe Fails
          |
          v
Removed From Endpoints
          |
          v
Traffic Continues to Pod B
```

---

# 16. Testing and Performance Engineering

The project includes automated backend and integration testing.

---

## Test Coverage Areas

```text
Automated Tests
      |
      +--> Authentication
      +--> JWT Validation
      +--> RBAC
      +--> API Contracts
      +--> Risk Engine
      +--> Idempotency
      +--> Dashboard
      +--> Semantic Search
      +--> Request IDs
      +--> Security Headers
      +--> Error Handling
```

---

## Performance Measurement

The benchmark suite measures:

```text
Requests
   |
   +--> Mean Latency
   |
   +--> p50
   |
   +--> p95
   |
   +--> p99
   |
   +--> Throughput
   |
   +--> Error Rate
```

---

## Why Percentiles Matter

```text
Latency Distribution

Fast Requests                    Slow Tail
|------------------------------------|
      p50        p95             p99
       |          |               |
       v          v               v
 Typical      Slow Users      Worst Tail
```

---

## PostgreSQL Analysis

Database queries are analyzed using:

```sql
EXPLAIN
ANALYZE
BUFFERS
```

Flow:

```text
SQL Query
   |
   v
PostgreSQL Planner
   |
   v
Execution Plan
   |
   +--> Scan Type
   +--> Planning Time
   +--> Execution Time
   +--> Buffer Activity
   +--> Index Usage
```

Performance reports are stored in:

```text
reports/
```

Results describe the local test environment and are not production-capacity claims.

---

# 17. Docker Architecture

Docker Compose provides the local distributed environment.

```text
Docker Compose
      |
      +--> frontend
      |
      +--> backend
      |
      +--> postgres
      |
      +--> mongo
      |
      +--> chroma
      |
      +--> rabbitmq
      |
      +--> event-service
      |
      +--> outbox-worker
```

---

## Local Ports

```text
React Frontend       :5173
FastAPI Backend      :8000
ChromaDB             :8001
Node Event Service   :3001
PostgreSQL           :5432
MongoDB              :27017
RabbitMQ AMQP        :5672
RabbitMQ Management  :15672
Ollama               :11434
```

---

# 18. Kubernetes Architecture

The project can run on a multi-node local Kubernetes cluster using `kind`.

---

## Kubernetes Workloads

```text
Kubernetes Namespace: fincompliance
              |
      +-------+-----------------------------+
      |                                     |
      v                                     v
 Deployments                           StatefulSets
      |                                     |
      +--> backend x2                       +--> PostgreSQL
      +--> frontend x2                      +--> MongoDB
      +--> outbox-worker x2                 +--> RabbitMQ
      +--> event-service                    +--> ChromaDB
```

---

## Kubernetes Platform View

```text
                         Kubernetes Cluster
                                |
          +---------------------+---------------------+
          |                                           |
          v                                           v
      Stateless                                   Stateful
          |                                           |
   +------+------+                             +------+------+------+
   |      |      |                             |      |      |      |
   v      v      v                             v      v      v      v
React  FastAPI Outbox                         PG    Mongo Rabbit  Chroma
 x2     x2    Worker x2
                 |
                 v
            Event Service
```

---

## Internal Service Discovery

```text
frontend
   |
   v
backend:8000
   |
   +--> postgres:5432
   |
   +--> chroma:8000
   |
   +--> event-service:3001

outbox-worker
   |
   +--> postgres:5432
   |
   +--> rabbitmq:5672

event-service
   |
   +--> rabbitmq:5672
   |
   +--> mongo:27017
```

---

## Health Probes

```text
Kubernetes
    |
    +--> Readiness Probe
    |        |
    |        └--> Can this pod receive traffic?
    |
    +--> Liveness Probe
             |
             └--> Should this container be restarted?
```

---

## Resource Controls

```text
Pod
 |
 +--> CPU Request
 +--> Memory Request
 +--> CPU Limit
 +--> Memory Limit
```

---

## Persistent Storage

```text
StatefulSet
    |
    v
PersistentVolumeClaim
    |
    v
PersistentVolume
    |
    v
Application Data
```

Used by:

- PostgreSQL
- MongoDB
- RabbitMQ
- ChromaDB

---

## Rolling Update

```text
Version A Pods
     |
     v
Create Version B Pod
     |
     v
Readiness Passes
     |
     v
Remove Version A Pod
     |
     v
Repeat
     |
     v
Version B Complete
```

---

## PodDisruptionBudget

```text
Backend replicas = 2
        |
        v
PodDisruptionBudget
        |
        v
At least 1 backend pod
must remain available
```

---

# 19. CI/CD and Release Engineering

GitHub Actions provides continuous integration and release automation.

---

## CI Pipeline

```text
Developer Push / Pull Request
              |
              v
         GitHub Actions
              |
      +-------+-------+----------------+
      |               |                |
      v               v                v
Backend Tests     Frontend Build   Node Validation
      |               |                |
      +-------+-------+----------------+
              |
              v
        Docker Builds
              |
              v
    Kubernetes Validation
              |
              v
        CI Successful
```

---

## CI Validations

```text
CI
 |
 +--> Python Compilation
 +--> Authentication Tests
 +--> JWT Tests
 +--> Integration Test Collection
 +--> React Build
 +--> Node Syntax Check
 +--> Backend Docker Build
 +--> Frontend Docker Build
 +--> Event-Service Docker Build
 +--> Kubernetes Manifest Rendering
 +--> Secret Hygiene
```

---

## Container Release Pipeline

```text
Git Tag
  |
  v
v1.0.0
  |
  v
GitHub Actions
  |
  +-----------------------------+
  |             |               |
  v             v               v
Backend       Event           Frontend
Image         Image            Image
  |             |               |
  +-------------+---------------+
                |
                v
              GHCR
                |
                v
       Versioned Containers
```

---

## Deployment Pipeline

```text
Released Container Images
           |
           v
GitHub Deployment Workflow
           |
           v
Kubernetes Cluster
           |
           v
Set Deployment Images
           |
           v
Rolling Update
           |
           v
Readiness Checks
           |
           v
Rollout Verification
           |
           v
Backend Smoke Test
```

---

## Local Release Pipeline

```text
Source Code
    |
    v
Docker Build
    |
    v
Load Images Into kind
    |
    v
kubectl set image
    |
    v
Rolling Deployment
    |
    v
Rollout Verification
```

---

## Dependabot

```text
Dependabot
    |
    +--> Python
    +--> Frontend npm
    +--> Event-Service npm
    +--> GitHub Actions
```

---

# 20. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, React Router |
| Animation | Framer Motion |
| Charts | Recharts |
| Icons | Lucide React |
| Backend | Python, FastAPI |
| ORM | SQLAlchemy |
| Validation | Pydantic |
| HTTP Client | HTTPX |
| Authentication | JWT / PyJWT |
| Password Hashing | PBKDF2-HMAC-SHA256 |
| Relational Database | PostgreSQL |
| Document Database | MongoDB |
| Vector Database | ChromaDB |
| Message Broker | RabbitMQ |
| Event Consumer | Node.js, Express, AMQP |
| AI Runtime | Ollama |
| Generative Model | Gemma 3 |
| Embedding Model | EmbeddingGemma |
| Containers | Docker |
| Local Orchestration | Docker Compose |
| Container Orchestration | Kubernetes |
| Local Kubernetes | kind |
| CI/CD | GitHub Actions |
| Registry | GitHub Container Registry |
| Dependency Automation | Dependabot |
| Testing | Pytest |
| API Documentation | OpenAPI / Swagger |

---

# 21. Repository Structure

```text
fincompliance-ai/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── clients/
│   │   ├── data/
│   │   ├── knowledge/
│   │   ├── repositories/
│   │   ├── schemas/
│   │   ├── scripts/
│   │   ├── services/
│   │   ├── workers/
│   │   ├── ai_models.py
│   │   ├── db.py
│   │   ├── hardening.py
│   │   ├── logging_config.py
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── security.py
│   │   └── settings.py
│   │
│   ├── tests/
│   ├── Dockerfile
│   ├── pytest.ini
│   └── requirements.txt
│
├── event-service/
│   ├── src/
│   │   └── index.js
│   ├── Dockerfile
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── components/
│   │   ├── data/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   │
│   ├── Dockerfile
│   ├── package.json
│   └── package-lock.json
│
├── k8s/
│   ├── backend.yaml
│   ├── chroma.yaml
│   ├── configmap.yaml
│   ├── event-service.yaml
│   ├── frontend.yaml
│   ├── kind-config.yaml
│   ├── kustomization.yaml
│   ├── mongo.yaml
│   ├── namespace.yaml
│   ├── outbox-worker.yaml
│   ├── postgres.yaml
│   ├── rabbitmq.yaml
│   └── secret.example.yaml
│
├── scripts/
│   ├── ci-local.sh
│   ├── create-release-tag.sh
│   ├── k8s-port-forward.sh
│   ├── k8s-status.sh
│   └── release-local.sh
│
├── reports/
│   ├── phase10_api_performance.md
│   ├── phase10_database_performance.md
│   ├── phase12_kubernetes.md
│   └── phase13_cicd.md
│
├── .github/
│   ├── workflows/
│   │   ├── ci.yml
│   │   ├── deploy.yml
│   │   └── release.yml
│   ├── dependabot.yml
│   └── pull_request_template.md
│
├── docker-compose.yml
├── docker-compose.override.yml
├── .env.example
├── .gitignore
└── README.md
```

---

# 22. API Overview

Base URL:

```text
/api/v1
```

---

## Authentication

```http
POST /api/v1/auth/login
GET  /api/v1/auth/me
```

---

## Customers

```http
GET /api/v1/customers
```

---

## Transactions

```http
GET  /api/v1/transactions
GET  /api/v1/transactions/{transaction_ref}
POST /api/v1/transactions
```

---

## Compliance

```http
POST /api/v1/compliance/transactions/{transaction_ref}/analyze

GET /api/v1/compliance/transactions/{transaction_ref}/assessment
```

---

## Semantic Knowledge

```http
GET /api/v1/knowledge/search
```

Example:

```text
/api/v1/knowledge/search?q=international+wire+transfer&limit=5
```

---

## AI Explanation

```http
POST /api/v1/ai/transactions/{transaction_ref}/explain

GET /api/v1/ai/transactions/{transaction_ref}/explanation
```

---

## Dashboard

```http
GET /api/v1/dashboard/overview
```

---

## Event Service

```http
GET /health
GET /events
GET /events/{event_id}
```

Filtering:

```http
GET /events?transaction_ref=<transaction_ref>

GET /events?event_type=<event_type>
```

---

# 23. Local Development

## Requirements

Install:

- Docker Desktop
- Docker Compose
- Ollama
- Python 3
- Node.js
- npm
- jq
- kubectl
- kind

---

## Ollama Models

```bash
ollama pull gemma3:4b
ollama pull embeddinggemma
```

Verify:

```bash
ollama list
```

Ollama runs locally at:

```text
http://localhost:11434
```

---

## Environment Configuration

Create:

```bash
cp .env.example .env
```

Local secrets must not be committed.

Protected files include:

```text
.env
.dev-credentials
.k8s-local-secrets
```

---

## Start with Docker Compose

```bash
docker compose up -d --build
```

Check:

```bash
docker compose ps
```

---

## Local URLs

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| FastAPI | http://localhost:8000 |
| Swagger | http://localhost:8000/docs |
| Event Service | http://localhost:3001 |
| ChromaDB | http://localhost:8001 |
| RabbitMQ Management | http://localhost:15672 |
| Ollama | http://localhost:11434 |

---

## Initialize PostgreSQL

```bash
docker compose exec backend \
  python -m app.scripts.init_db
```

---

## Initialize Transactional Outbox

```bash
docker compose exec backend \
  python -m app.scripts.init_outbox
```

---

## Seed Compliance Policies

```bash
docker compose exec backend \
  python -m app.scripts.seed_compliance_policies
```

---

## Run Tests

```bash
docker compose run --rm backend \
  python -m pytest -q
```

---

# 24. Kubernetes Deployment

## Create Cluster

```bash
kind create cluster \
  --name fincompliance \
  --config k8s/kind-config.yaml
```

---

## Apply Namespace

```bash
kubectl apply \
  -f k8s/namespace.yaml
```

---

## Apply Resources

```bash
kubectl apply -k k8s
```

---

## Inspect Pods

```bash
kubectl get pods \
  -n fincompliance
```

---

## Inspect All Workloads

```bash
./scripts/k8s-status.sh
```

---

## Start Port Forwarding

```bash
./scripts/k8s-port-forward.sh
```

Then:

```text
Frontend
http://localhost:5173

Backend
http://localhost:8000

Event Service
http://localhost:3001

RabbitMQ
http://localhost:15672
```

---

## Scale Backend

```bash
kubectl scale \
  deployment/backend \
  -n fincompliance \
  --replicas=3
```

---

## Perform Local Release

```bash
./scripts/release-local.sh phase13
```

---

# 25. Engineering Trade-Offs

## Deterministic Engine vs LLM Decisions

Chosen:

```text
Deterministic Risk Engine
          +
Generative Explanation
```

Instead of:

```text
LLM Determines Risk
```

Reason:

- reproducibility
- auditability
- testing
- predictable behavior

---

## PostgreSQL vs MongoDB

PostgreSQL is used for transactional truth.

MongoDB is used for flexible operational events.

```text
Strong Structured Relationships
          |
          v
      PostgreSQL


Flexible Heterogeneous Events
          |
          v
        MongoDB
```

---

## Synchronous Events vs Outbox

Original simple model:

```text
Backend
  |
  v
HTTP Event Publish
  |
  v
Event Service
```

Improved model:

```text
Backend
  |
  v
PostgreSQL Outbox
  |
  v
RabbitMQ
  |
  v
Consumer
```

The latter improves delivery reliability and service decoupling.

---

## Local LLM vs External AI API

Ollama allows the entire AI workflow to run locally.

```text
Application
    |
    v
Local Ollama
    |
    +--> EmbeddingGemma
    |
    └--> Gemma 3
```

This keeps the demonstration environment self-contained.

---

## Multiple Databases

The project intentionally uses multiple storage technologies because each demonstrates a different workload:

```text
PostgreSQL  -> transactional consistency

MongoDB     -> operational event documents

ChromaDB    -> vector similarity retrieval
```

---

# 26. Project Scope and Disclaimer

FinCompliance AI is an engineering demonstration project.

The following are synthetic:

- customers
- transactions
- policy documents
- compliance rules
- risk thresholds
- generated explanations

The application demonstrates software architecture and AI-system integration. It is not intended to provide:

- legal advice
- regulatory advice
- banking advice
- investment advice
- official compliance decisions

The system should not be treated as a production financial-compliance product without additional domain validation, regulatory review, security controls, operational governance, and production-grade infrastructure.

---

# Complete System Summary

```text
                           FINCOMPLIANCE AI
                                  |
     +----------------------------+-----------------------------+
     |                            |                             |
     v                            v                             v
 TRANSACTION                 COMPLIANCE                     PLATFORM
 PROCESSING                 INTELLIGENCE                  ENGINEERING
     |                            |                             |
     v                            v                             v
 FastAPI                    Risk Engine                      Docker
     |                            |                             |
     v                            v                             v
PostgreSQL                  ChromaDB                      Kubernetes
     |                            |                             |
     v                            v                             v
Outbox                     Embeddings                   GitHub Actions
     |                            |                             |
     v                            v                             v
RabbitMQ                    Gemma 3                        CI / CD
     |                            |
     v                            v
Node Consumer           Grounded Explanation
     |
     v
MongoDB
     |
     v
Audit Trail

                   Everything surfaced through
                           React UI
```

---

## Final Processing Model

```text
                    FINANCIAL TRANSACTION
                             |
                             v
                         FastAPI
                             |
               +-------------+-------------+
               |                           |
               v                           v
          PostgreSQL                 Risk Engine
               |                           |
               |                           v
               |                     Risk Assessment
               |                           |
               |                +----------+----------+
               |                |                     |
               |                v                     v
               |          Triggered Rules      Semantic Query
               |                                      |
               |                                      v
               |                               EmbeddingGemma
               |                                      |
               |                                      v
               |                                  ChromaDB
               |                                      |
               |                                      v
               |                               Policy Context
               |                                      |
               |                         +------------+------------+
               |                         |                         |
               |                         v                         v
               |                    Risk Context              Policy Context
               |                         |                         |
               |                         +------------+------------+
               |                                      |
               |                                      v
               |                                   Gemma 3
               |                                      |
               |                                      v
               |                            Grounded Explanation
               |                                      |
               +----------------------+---------------+
                                      |
                                      v
                                PostgreSQL
                                      |
                                      v
                             Transactional Outbox
                                      |
                                      v
                                Outbox Workers
                                      |
                                      v
                                  RabbitMQ
                                      |
                                      v
                             Node Event Consumer
                                      |
                                      v
                                   MongoDB
                                      |
                                      v
                                Audit Timeline

                                      +
                                      |
                                      v

                                React Dashboard
```
