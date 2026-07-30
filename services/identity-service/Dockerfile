FROM python:3.11-slim

WORKDIR /app

COPY pyproject.toml .
RUN pip install --no-cache-dir fastapi uvicorn pydantic pydantic-settings PyJWT email-validator httpx python-jose[cryptography] passlib[bcrypt] beanie motor asyncpg sqlalchemy pgvector redis pika google-generativeai

COPY shared ./shared
COPY services/identity-service ./service

ENV PYTHONPATH=/app

EXPOSE 8001
CMD ["uvicorn", "service.app.main:app", "--host", "0.0.0.0", "--port", "8001"]
