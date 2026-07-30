FROM python:3.11-slim

WORKDIR /app

COPY pyproject.toml .
COPY shared ./shared
COPY services/ai-service ./service

RUN pip install --no-cache-dir fastapi uvicorn pydantic pydantic-settings PyJWT email-validator httpx python-jose[cryptography] passlib[bcrypt] beanie==1.28.0 motor asyncpg sqlalchemy pgvector redis pika google-generativeai

ENV PYTHONPATH=/app

EXPOSE 8004
CMD ["uvicorn", "service.app.main:app", "--host", "0.0.0.0", "--port", "8004"]
