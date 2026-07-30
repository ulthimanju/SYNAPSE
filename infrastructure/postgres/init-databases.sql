-- Create synapse_vectors database if it does not exist
CREATE DATABASE synapse_vectors;

-- Connect to synapse_vectors and enable pgvector extension
\c synapse_vectors;
CREATE EXTENSION IF NOT EXISTS vector;
