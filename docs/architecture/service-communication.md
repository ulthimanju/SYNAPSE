# Service & Data Architecture

## Detailed System Architecture Diagram

```mermaid
graph TD
    Client["Frontend"]
    Gateway["API Gateway"]

    Identity["Identity Service"]
    Workspace["Workspace Service"]
    Document["Document Processing Service"]
    AI["AI Service"]
    RAG["RAG Chat Service"]

    PG[(PostgreSQL)]
    MW[(MongoDB - Workspace DB)]
    MD[(MongoDB - Document DB)]
    MC[(MongoDB - Chat DB)]
    Vec[(pgvector)]
    Store[(Object Storage - MinIO)]

    Client --> Gateway

    Gateway --> Identity
    Gateway --> Workspace
    Gateway --> RAG

    Identity --> PG

    Workspace --> MW
    Workspace --> Document
    Workspace --> AI

    Document --> MD
    Document --> Vec
    Document --> Store
    Document --> AI

    RAG --> MC
    RAG --> Workspace
    RAG --> Document
    RAG --> AI
```

## Storage & Service Mapping

| Service | Primary Storage | Secondary / Special Storage | Purpose |
| :--- | :--- | :--- | :--- |
| **Identity Service** | PostgreSQL (`PG`) | - | Auth, User Accounts, Credentials, JWT & Roles |
| **Workspace Service** | MongoDB (`MW`) | - | Workspace management, Projects & User Memberships |
| **Document Processing Service** | MongoDB (`MD`) | pgvector (`Vec`), MinIO (`Store`) | Document metadata, Raw file storage & Vector embeddings |
| **RAG Chat Service** | MongoDB (`MC`) | - | Chat sessions, Message history & RAG context assembly |
| **AI Service** | Stateless / External APIs | - | Gemini 2.5 Flash, LlamaParser API & Embedding generation |
