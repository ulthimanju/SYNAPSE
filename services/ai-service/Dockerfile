FROM python:3.11-slim

# Prevent bytecode creation and buffer outputs immediately
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends ca-certificates && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Security best practice: Create non-root user early
RUN useradd --create-home --shell /bin/bash appuser

# Upgrade pip and install pinned Python dependencies
RUN pip install --no-cache-dir --no-compile --upgrade pip && \
    pip install --no-cache-dir --no-compile \
        asyncpg==0.31.0 \
        beanie==1.28.0 \
        email-validator==2.3.0 \
        fastapi==0.141.1 \
        google-generativeai==0.8.6 \
        httpx==0.28.1 \
        motor==3.7.1 \
        passlib[bcrypt]==1.7.4 \
        pgvector==0.5.0 \
        pika==1.4.2 \
        pydantic==2.13.4 \
        pydantic-settings==2.14.2 \
        PyJWT==2.13.0 \
        python-jose[cryptography]==3.5.0 \
        redis==8.1.0 \
        sqlalchemy==2.0.51 \
        uvicorn==0.52.0

# Copy application source code with user ownership
COPY --chown=appuser:appuser shared ./shared
COPY --chown=appuser:appuser services/ai-service ./service

USER appuser

EXPOSE 8004

# Container Healthcheck using standard library urllib
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8004/health')"

CMD ["uvicorn", "service.app.main:app", "--host", "0.0.0.0", "--port", "8004", "--proxy-headers"]
