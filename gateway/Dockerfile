FROM python:3.11-slim

WORKDIR /app

COPY pyproject.toml .
COPY shared ./shared
COPY gateway ./service

RUN pip install --no-cache-dir fastapi uvicorn pydantic pydantic-settings PyJWT email-validator httpx python-jose[cryptography] passlib[bcrypt] redis

ENV PYTHONPATH=/app

EXPOSE 8000
CMD ["uvicorn", "service.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
