FROM python:3.11-slim

RUN apt-get update && apt-get install -y --no-install-recommends qpdf && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY pyproject.toml .
COPY shared ./shared
COPY services/document-service ./service

RUN pip install --no-cache-dir fastapi uvicorn pydantic pydantic-settings PyJWT email-validator httpx python-jose[cryptography] passlib[bcrypt] beanie==1.28.0 motor asyncpg sqlalchemy pgvector redis pika aio-pika python-multipart pypdf pikepdf google-generativeai llama-parse llama-index-core minio

ENV PYTHONPATH=/app

EXPOSE 8003
CMD ["uvicorn", "service.app.main:app", "--host", "0.0.0.0", "--port", "8003"]
