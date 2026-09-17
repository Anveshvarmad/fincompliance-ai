# FinCompliance AI

FinCompliance AI is a full-stack financial compliance intelligence platform that combines deterministic risk analysis, semantic policy retrieval, generative AI, event-driven architecture, security, observability, and Kubernetes-based deployment.

The platform ingests financial transactions, evaluates them through a deterministic compliance engine, retrieves relevant compliance-policy context from a vector database, generates grounded AI explanations, stores audit events asynchronously, and exposes the complete workflow through a React dashboard.

---

## Architecture

```text
Financial Transaction
        |
        v
     FastAPI
        |
        v
Deterministic Risk Engine
        |
        +-----------------------------+
        |                             |
        v                             v
   PostgreSQL                     ChromaDB
Transactions / Risk              Policy Vectors
        |                             |
        |                       EmbeddingGemma
        |                             |
        +-------------+---------------+
                      |
                      v
                   Gemma 3
                      |
                      v
            Grounded AI Explanation
                      |
                      v
               React Dashboard

Audit events follow a separate asynchronous pipeline:

PostgreSQL Business Transaction
            |
            +--------------------+
            |                    |
            v                    v
      Business Data       Transactional Outbox
                                 |
                                 v
                           Outbox Worker
                                 |
                                 v
                              RabbitMQ
                                 |
                                 v
                       Node.js Event Consumer
                                 |
                                 v
                              MongoDB
                                 |
                                 v
                         Audit Timeline
Core Features
Transaction Management

The platform supports:

transaction creation
transaction retrieval
filtering
pagination
customer association
detailed transaction investigation

Transaction data includes:

transaction reference
customer
amount
currency
transaction type
origin country
destination country
status
transaction timestamp
Deterministic Risk Engine

Compliance risk is calculated using explicit deterministic business rules.

Example rule categories include:

high-value transactions
very-high-value transactions
cross-border transactions
wire transfers
large cash withdrawals
customer geographic inconsistencies

Each triggered rule contributes a defined score.

Example:

Transaction Amount: $22,500
Origin: US
Destination: SG
Type: Wire Transfer

HIGH_VALUE                 +30
CROSS_BORDER               +20
WIRE_TRANSFER              +15
--------------------------------
Risk Score                  65
Risk Level                  HIGH

Risk levels:

0 - 24      LOW
25 - 49     MEDIUM
50 - 74     HIGH
75 - 100    CRITICAL

Risk assessments are idempotent. Re-analyzing the same transaction returns the existing assessment instead of creating duplicate results.

Retrieval-Augmented AI Explanation

FinCompliance AI uses Retrieval-Augmented Generation to explain deterministic compliance decisions.

Transaction
    |
    v
Risk Assessment
    |
    v
Semantic Policy Query
    |
    v
Embedding Generation
    |
    v
ChromaDB Retrieval
    |
    v
Relevant Policy Context
    |
    v
Gemma 3
    |
    v
Grounded Explanation

The AI output contains:

summary
rationale
recommended action
supporting policy sources
model metadata
prompt version

The AI model does not calculate or modify the risk score.

The deterministic compliance engine remains the authoritative source for risk classification.

Semantic Policy Search

Synthetic compliance-policy documents are chunked, embedded, and stored in ChromaDB.

Compliance Policies
        |
        v
     Chunking
        |
        v
 EmbeddingGemma
        |
        v
Vector Embeddings
        |
        v
    ChromaDB

Users can search policies using natural-language queries such as:

large international wire transfer

Search results contain:

policy ID
policy title
category
chunk ID
text
vector distance
rank

Vector distance is used only for semantic retrieval and is not treated as compliance confidence.

Transactional Outbox

The application uses the transactional outbox pattern to solve the database/event dual-write problem.

Without an outbox:

1. Commit business transaction
2. Publish audit event
3. Event service fails
4. Business transaction exists
5. Audit event is lost

With the outbox:

BEGIN DATABASE TRANSACTION

    INSERT business data
    INSERT outbox event

COMMIT

        |
        v
Outbox Worker
        |
        v
RabbitMQ
        |
        v
Event Consumer

The business record and outbox record are created atomically inside PostgreSQL.

If RabbitMQ or MongoDB becomes unavailable, the unpublished event remains in the outbox and can be retried later.

Event-Driven Audit Trail

Operational events include:

TRANSACTION_CREATED
RISK_ASSESSMENT_CREATED
AI_EXPLANATION_CREATED

The event pipeline uses:

PostgreSQL transactional outbox
background outbox workers
RabbitMQ
Node.js consumer
MongoDB

The system uses at-least-once delivery.

MongoDB maintains a unique index on event_id, allowing duplicate queue deliveries to be processed safely.

Frontend

The frontend is built with React and Vite.

It uses a dark financial-intelligence interface with multiple operational workspaces.

Overview

The command center displays live metrics including:

total transactions
total customers
risk assessment count
high-risk transaction count
AI explanation count
average risk score
assessment coverage
AI coverage
audit event count
risk distribution
recent assessments
recent transactions
service health
Transactions

The transaction explorer provides:

live transaction data
filters
pagination
transaction inspection
navigation to risk investigation
Risk Investigation

The transaction investigation page displays:

transaction details
deterministic risk score
risk level
triggered rules
score contributions
analysis status
Knowledge Workspace

The knowledge workspace provides semantic search across compliance policies stored in ChromaDB.

AI Workspace

The AI workspace combines:

Transaction
     |
     v
Deterministic Rules
     |
     v
Policy Retrieval
     |
     v
Gemma 3
     |
     v
Grounded Explanation

It displays:

risk score
risk level
triggered rules
AI summary
rationale
recommended action
retrieved policy sources
Audit Workspace

The audit workspace displays events stored in MongoDB.

Users can inspect:

event type
event ID
transaction reference
event source
occurred time
received time
event payload

Events can be filtered by transaction and event type.

Technology Stack
Frontend
React
Vite
React Router
Framer Motion
Recharts
Lucide React
JavaScript
CSS
Backend
Python
FastAPI
SQLAlchemy
Pydantic
HTTPX
PyJWT
Psycopg
Databases
PostgreSQL
MongoDB
ChromaDB
AI
Ollama
Gemma 3
EmbeddingGemma
Event Infrastructure
RabbitMQ
Node.js
Express
AMQP
Infrastructure
Docker
Docker Compose
Kubernetes
kind
CI/CD
GitHub Actions
GitHub Container Registry
Dependabot
Repository Structure
fincompliance-ai/
|
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
│   │   ├── db.py
│   │   ├── hardening.py
│   │   ├── logging_config.py
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── security.py
│   │   └── settings.py
│   |
│   ├── tests/
│   ├── Dockerfile
│   ├── pytest.ini
│   └── requirements.txt
|
├── event-service/
│   ├── src/
│   │   └── index.js
│   ├── Dockerfile
│   ├── package.json
│   └── package-lock.json
|
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   |
│   ├── Dockerfile
│   ├── package.json
│   └── package-lock.json
|
├── k8s/
│   ├── backend.yaml
│   ├── chroma.yaml
│   ├── configmap.yaml
│   ├── event-service.yaml
│   ├── frontend.yaml
│   ├── mongo.yaml
│   ├── namespace.yaml
│   ├── outbox-worker.yaml
│   ├── postgres.yaml
│   ├── rabbitmq.yaml
│   ├── secret.example.yaml
│   └── kustomization.yaml
|
├── scripts/
├── reports/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml
│   │   ├── deploy.yml
│   │   └── release.yml
│   ├── dependabot.yml
│   └── pull_request_template.md
|
├── docker-compose.yml
├── docker-compose.override.yml
├── .env.example
└── README.md
Authentication and Authorization

The platform uses JWT-based authentication with role-based access control.

Viewer

Can access read-oriented functionality such as:

transactions
dashboard
policy knowledge
Analyst

Includes viewer permissions plus:

deterministic risk analysis
AI explanation generation
Admin

Highest privileged application role.

Passwords are stored as PBKDF2-HMAC-SHA256 hashes using random salts.

JWT tokens are signed using an environment-managed secret.

Backend Security

The FastAPI layer includes:

JWT authentication
role-based authorization
request IDs
API rate limiting
standardized error responses
validation handling
security headers
timeout handling
retry logic
structured JSON logging

Security headers include:

X-Content-Type-Options
X-Frame-Options
Referrer-Policy
Permissions-Policy
Observability

Each backend request receives an X-Request-ID.

Clients can also provide their own request ID.

Example structured log:

{
  "timestamp": "2026-09-16T20:30:00Z",
  "level": "INFO",
  "logger": "fincompliance.request",
  "message": "HTTP request completed",
  "request_id": "request-id",
  "method": "GET",
  "path": "/api/v1/transactions",
  "status_code": 200,
  "duration_ms": 12.7
}
Resilience

External services use explicit timeouts and retry behavior.

Retryable HTTP status codes include:

429
500
502
503
504

Retry handling is applied to external dependencies such as:

Ollama
embedding generation
HTTP integrations
Storage Responsibilities
Storage	Purpose
PostgreSQL	Customers, transactions, risk assessments, AI results, outbox
MongoDB	Flexible audit event history
ChromaDB	Compliance policy vector embeddings
RabbitMQ	Asynchronous event transport

This separation allows each system to handle the workload for which it is best suited.

Synthetic Compliance Policies

The project includes synthetic policy documents for demonstrating RAG and semantic retrieval.

Categories include:

high-value transaction review
cross-border transaction review
wire transfer monitoring
cash withdrawal monitoring
customer geographic consistency
transaction velocity
customer profile review
risk escalation

The policies are demonstration data and do not represent official regulatory or institutional policy.

Local Development
Requirements

Recommended tools:

Docker Desktop
Docker Compose
Ollama
Node.js
npm
Python 3
kubectl
kind
jq
Ollama Setup

Install the required models:

ollama pull gemma3:4b
ollama pull embeddinggemma

Verify:

ollama list

Ollama should run at:

http://localhost:11434
Environment Setup

Create the local configuration:

cp .env.example .env

Sensitive local files should never be committed.

Examples:

.env
.dev-credentials
.k8s-local-secrets
Docker Compose

Start the application:

docker compose up -d --build

Check services:

docker compose ps
Frontend
http://localhost:5173
Backend
http://localhost:8000
Swagger API Documentation
http://localhost:8000/docs
Event Service
http://localhost:3001
RabbitMQ Management
http://localhost:15672
ChromaDB
http://localhost:8001
Initialize Database

Initialize application tables:

docker compose exec backend \
  python -m app.scripts.init_db

Initialize the transactional outbox:

docker compose exec backend \
  python -m app.scripts.init_outbox
Seed Compliance Policies

After Ollama is running:

docker compose exec backend \
  python -m app.scripts.seed_compliance_policies

This generates embeddings and stores policy chunks in ChromaDB.

API Endpoints

Base path:

/api/v1
Authentication
POST /api/v1/auth/login
GET  /api/v1/auth/me
Customers
GET /api/v1/customers
Transactions
GET  /api/v1/transactions
GET  /api/v1/transactions/{transaction_ref}
POST /api/v1/transactions
Compliance
POST /api/v1/compliance/transactions/{transaction_ref}/analyze

GET /api/v1/compliance/transactions/{transaction_ref}/assessment
Knowledge
GET /api/v1/knowledge/search

Example:

/api/v1/knowledge/search?q=international+wire+transfer&limit=5
AI
POST /api/v1/ai/transactions/{transaction_ref}/explain

GET /api/v1/ai/transactions/{transaction_ref}/explanation
Dashboard
GET /api/v1/dashboard/overview
Event Service API

Health:

GET /health

List events:

GET /events

Filter by transaction:

GET /events?transaction_ref=<transaction_ref>

Filter by type:

GET /events?event_type=<event_type>

Retrieve one event:

GET /events/{event_id}
Testing

The backend contains automated tests for:

authentication
JWT handling
role-based access control
API access
deterministic compliance analysis
idempotency
dashboard contracts
semantic retrieval
request IDs
security headers
error handling

Run tests:

docker compose run --rm backend \
  python -m pytest -q
Performance Engineering

The project contains tools for measuring:

mean latency
p50 latency
p95 latency
p99 latency
throughput
request failure rate

PostgreSQL performance analysis uses:

EXPLAIN
ANALYZE
BUFFERS

Generated reports are stored under:

reports/

Performance results depend on the machine, dataset, and environment used for testing.

Kubernetes

The platform can run on a local Kubernetes cluster using kind.

Kubernetes resources include:

Deployments
StatefulSets
Services
ConfigMaps
Secrets
PersistentVolumeClaims
readiness probes
liveness probes
resource requests
resource limits
rolling updates
PodDisruptionBudgets
initialization jobs
Kubernetes Deployments
backend
frontend
event-service
outbox-worker

The backend, frontend, and outbox worker support multiple replicas.

Kubernetes StatefulSets
postgres
mongo
rabbitmq
chroma
Kubernetes Deployment

Create the cluster:

kind create cluster \
  --name fincompliance \
  --config k8s/kind-config.yaml

Apply resources:

kubectl apply -k k8s

Check status:

kubectl get pods \
  -n fincompliance
Local Kubernetes Access

Start port forwarding:

./scripts/k8s-port-forward.sh

Services become available at:

Frontend
http://localhost:5173

Backend
http://localhost:8000

Event Service
http://localhost:3001

RabbitMQ
http://localhost:15672
Scaling

Scale the backend:

kubectl scale \
  deployment/backend \
  -n fincompliance \
  --replicas=3

The outbox worker uses:

FOR UPDATE SKIP LOCKED

so multiple workers can safely claim different pending outbox records.

Rolling Releases

Run a local release:

./scripts/release-local.sh phase13

The release process:

Docker Build
      |
      v
Load Images Into kind
      |
      v
Update Kubernetes Deployment
      |
      v
Rolling Update
      |
      v
Rollout Verification
CI/CD

GitHub Actions handles continuous integration and release automation.

CI validates:

backend source
authentication tests
React build
Node.js validation
Docker builds
Kubernetes manifests
secret hygiene
Container Releases

Version tags can publish immutable images to GitHub Container Registry.

Containers are built for:

backend
event-service
frontend

Example release:

./scripts/create-release-tag.sh v1.0.0
Dependency Automation

Dependabot monitors:

Python packages
frontend npm packages
event-service npm packages
GitHub Actions dependencies
Failure Handling
RabbitMQ Failure

Business transactions can still commit.

The outbox record remains in PostgreSQL and can be published when RabbitMQ becomes available again.

MongoDB Failure

RabbitMQ retains unacknowledged events until the consumer can process them successfully.

Duplicate Delivery

MongoDB's unique event_id index prevents duplicate audit documents.

Ollama Failure

Transaction management and deterministic risk scoring remain available.

AI generation and embedding operations require Ollama.

ChromaDB Failure

Core transactional functionality remains available.

Semantic policy retrieval and grounded AI explanations are affected until ChromaDB recovers.

Backend Pod Failure

Kubernetes removes unhealthy replicas from service endpoints and continues routing requests to healthy replicas.

Design Principles
Deterministic decisions, generative explanations

The AI model explains compliance results but does not determine the authoritative risk score.

Storage by workload

PostgreSQL stores structured business state.

MongoDB stores flexible event history.

ChromaDB stores semantic policy vectors.

Reliable event delivery

The transactional outbox separates business commits from asynchronous event publication.

Idempotent processing

Repeated compliance analysis does not create duplicate risk assessments.

Duplicate queue events are protected by unique event identifiers.

Observable infrastructure

Health checks, request IDs, structured logs, Kubernetes probes, and performance measurements make system behavior easier to inspect.
