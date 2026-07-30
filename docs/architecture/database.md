# Database Architecture & Infrastructure Decisions

## 1. MongoDB Database Strategy

- **Topology**: Single MongoDB Instance (`mongo:latest`)
- **Logical Database Separation**:
  - `synapse_workspace`: Owned strictly by `Workspace Service`
  - `synapse_document`: Owned strictly by `Document Processing Service`
  - `synapse_chat`: Owned strictly by `RAG Chat Service`

## 2. PostgreSQL & pgvector Strategy

- **Topology**: Single PostgreSQL Container (`pgvector/pgvector:pg16`)
- **Logical Database Separation**:
  - `synapse_identity`: Owned strictly by `Identity Service` (users, roles, refresh_tokens)
  - `synapse_vectors`: Owned strictly by `Document Processing Service` (document_embeddings with `pgvector` extension enabled)

## 3. Storage & Object Store Strategy

- **MinIO**: S3-compatible bucket `synapse-documents` for raw file uploads and processed document artifacts.
