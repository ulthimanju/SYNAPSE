# Synapse

An intelligent microservices-based workspace powered by AI, Vector Search, document processing, and microservice orchestration.

## Architecture Overview

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS, JS | Modern interactive UI & dashboard |
| **API Gateway** | FastAPI, Redis | Entry point, routing, rate limiting & caching |
| **Authentication Service** | FastAPI, PostgreSQL, SQLAlchemy, Authlib, JWT | User management, OAuth & JWT auth |
| **Workspace Microservice** | FastAPI, MongoDB, Beanie | High-performance document & workspace state management |
| **AI & Vector Service** | FastAPI, Gemini 2.5 Flash, LlamaParser, pgvector | Document parsing, RAG embeddings & intelligent agent execution |
| **Storage & Cache** | MinIO, Redis | S3-compatible object storage & fast caching layer |
| **Messaging** | RabbitMQ | Event-driven messaging & background job processing |

## Project Structure

```text
Synapse/
├── docker-compose.yml       # Infrastructure orchestration (Postgres, Mongo, Redis, RabbitMQ, MinIO)
├── .env.example             # Template environment variables
├── README.md                # Project architecture & documentation
├── web-app/                 # React 19 + Vite + Tailwind CSS Application
└── backend/
    ├── gateway/             # FastAPI API Gateway
    └── services/
        ├── auth/            # Auth microservice (Postgres, SQLAlchemy, Authlib, JWT)
        ├── workspace/       # Workspace microservice (MongoDB, Beanie)
        └── ai_service/      # Document Parsing, Gemini API, pgvector RAG
```

## Quick Start (Infrastructure)

1. Start all infrastructure containers:
   ```bash
   docker compose up -d
   ```
2. Check running services:
   - PostgreSQL (pgvector): `localhost:5432`
   - MongoDB: `localhost:27017`
   - Redis: `localhost:6379`
   - RabbitMQ Management UI: `http://localhost:15672` (synapse / synapse_pass)
   - MinIO Console: `http://localhost:9001` (minioadmin / minioadminpassword)
