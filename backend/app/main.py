"""FastAPI application entrypoint with security headers, CORS, and centralized exception handling.

Educational Notes for Students:
------------------------------
1. Defense in Depth:
   - CORS is restricted to explicit trusted origins.
   - Security headers (HSTS, nosniff, frame protection) shield against common web vulnerabilities.
2. Zero Technical Leaks:
   - Unhandled exceptions are captured by the global exception handler, logged internally,
     and replaced with safe, opaque error messages to avoid leaking implementation details.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from starlette.middleware.base import BaseHTTPMiddleware

from app.api.v1.auth import router as auth_router
from app.api.v1.courses import router as courses_router
from app.core.config import settings
from app.core.database import Base, engine
from app.core.exceptions import (
    InactiveUserError,
    InvalidCredentialsError,
    ResourceNotFoundError,
    UserAlreadyExistsError,
)
from app.core.limiter import limiter

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("flashlearn.api")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context: initialize database tables on startup."""
    logger.info("Initializing database tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database initialized successfully.")
    yield
    logger.info("Shutting down FlashLearn AI backend.")


from fastapi.openapi.docs import (
    get_redoc_html,
    get_swagger_ui_html,
    get_swagger_ui_oauth2_redirect_html,
)

# Initialize FastAPI application
# Security Best Practice: Disable Swagger & OpenAPI exploration in production
is_development = settings.ENVIRONMENT == "development"

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Educational AI platform: Extracts key concepts, flashcards, and gamified quizzes from lecture notes.",
    version="1.0.0",
    docs_url=None,  # Handled by custom route below for maximum CDN reliability
    redoc_url=None,
    openapi_url="/openapi.json" if is_development else None,
    lifespan=lifespan,
)

if is_development:
    @app.get("/docs", include_in_schema=False)
    async def custom_swagger_ui_html():
        """Custom Swagger UI route using high-availability CDN bundle with dark/modern styling."""
        return get_swagger_ui_html(
            openapi_url=app.openapi_url or "/openapi.json",
            title=f"{settings.PROJECT_NAME} - Interactive API Docs",
            oauth2_redirect_url=app.swagger_ui_oauth2_redirect_url,
            swagger_js_url="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js",
            swagger_css_url="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css",
        )

    @app.get(app.swagger_ui_oauth2_redirect_url, include_in_schema=False)
    async def swagger_ui_redirect():
        return get_swagger_ui_oauth2_redirect_html()

    @app.get("/redoc", include_in_schema=False)
    async def custom_redoc_html():
        """Custom ReDoc route using unpkg standalone bundle."""
        return get_redoc_html(
            openapi_url=app.openapi_url or "/openapi.json",
            title=f"{settings.PROJECT_NAME} - ReDoc Specification",
            redoc_js_url="https://unpkg.com/redoc@2/bundles/redoc.standalone.js",
        )


# Configure Rate Limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# -----------------------------------------------------------------------------
# Security Middleware: HTTP Headers Hardening
# -----------------------------------------------------------------------------


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Appends security headers to all HTTP responses."""

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response


app.add_middleware(SecurityHeadersMiddleware)

# -----------------------------------------------------------------------------
# CORS Middleware Configuration
# -----------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


# -----------------------------------------------------------------------------
# Domain Exception Handlers (Mapping pure business errors to HTTP responses)
# -----------------------------------------------------------------------------


@app.exception_handler(UserAlreadyExistsError)
async def user_exists_handler(request: Request, exc: UserAlreadyExistsError):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": exc.message},
    )


@app.exception_handler(InvalidCredentialsError)
async def invalid_credentials_handler(request: Request, exc: InvalidCredentialsError):
    return JSONResponse(
        status_code=status.HTTP_401_UNAUTHORIZED,
        content={"detail": exc.message},
        headers={"WWW-Authenticate": "Bearer"},
    )


@app.exception_handler(InactiveUserError)
async def inactive_user_handler(request: Request, exc: InactiveUserError):
    return JSONResponse(
        status_code=status.HTTP_403_FORBIDDEN,
        content={"detail": exc.message},
    )


@app.exception_handler(ResourceNotFoundError)
async def resource_not_found_handler(request: Request, exc: ResourceNotFoundError):
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={"detail": exc.message},
    )


# -----------------------------------------------------------------------------
# Centralized Zero-Leak Exception Handler
# -----------------------------------------------------------------------------


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Captures unhandled errors to prevent stack trace leakage to clients."""
    logger.error(
        f"Unhandled server error on {request.method} {request.url.path}: {exc!s}",
        exc_info=True,
    )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Our team has been notified."},
    )


# -----------------------------------------------------------------------------
# Health Check Endpoint
# -----------------------------------------------------------------------------


@app.get("/health", tags=["Health"])
async def health_check():
    """Liveness probe used by Docker and Google Cloud Run."""
    return {"status": "healthy", "environment": settings.ENVIRONMENT}


# -----------------------------------------------------------------------------
# Mount API Routers
# -----------------------------------------------------------------------------

app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(courses_router, prefix=settings.API_V1_STR)
