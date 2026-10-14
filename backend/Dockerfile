# Multi-stage production Dockerfile for FlashLearn AI Backend
# Base image with official slim Python distribution
FROM python:3.11-slim AS base

# Security & Python optimization flags
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

WORKDIR /app

# Install build dependencies, curl for healthchecks
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies in isolated layer for build caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code & Alembic migration configuration
COPY app/ /app/app/
COPY alembic/ /app/alembic/
COPY alembic.ini /app/

# Security Hardening: Run as an unprivileged non-root user
RUN groupadd -g 1001 appgroup && \
    useradd -u 1001 -g appgroup -s /bin/bash -m appuser && \
    chown -R appuser:appgroup /app

USER appuser

EXPOSE 8000

# Container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

ENV PORT=8000

# Production server entrypoint (applies schema migrations at boot, then starts Uvicorn on $PORT)
CMD ["sh", "-c", "alembic upgrade head || true && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]

