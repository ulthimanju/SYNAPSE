FROM python:3.11-slim

# Prevent bytecode creation and buffer outputs immediately
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

# Install system dependencies (ca-certificates for HTTPS, curl for healthchecks)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        ca-certificates \
        curl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Upgrade pip and install pinned Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir \
        email-validator==2.3.0 \
        fastapi==0.141.1 \
        httpx==0.28.1 \
        passlib[bcrypt]==1.7.4 \
        pydantic==2.13.4 \
        pydantic-settings==2.14.2 \
        PyJWT==2.13.0 \
        python-jose[cryptography]==3.5.0 \
        redis==8.1.0 \
        uvicorn==0.52.0

# Copy application source code
COPY shared ./shared
COPY gateway ./service

# Security best practice: Create non-root user and assign directory permissions
RUN useradd --create-home --shell /bin/bash appuser && \
    chown -R appuser:appuser /app

USER appuser

EXPOSE 8000

# Container Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "service.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
