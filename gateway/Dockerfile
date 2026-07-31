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

# Copy application source code with user ownership
COPY --chown=appuser:appuser shared ./shared
COPY --chown=appuser:appuser gateway ./service

USER appuser

EXPOSE 8000

# Container Healthcheck using standard library urllib
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"

CMD ["uvicorn", "service.app.main:app", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers"]
