# Antigravity Agent Guidelines — FlashLearn AI

## Core Mission & Philosophy
- **Primary Goal**: Build an educational, gamified, and production-grade fullstack web application for students.
- **Audience**: Students and developers learning fullstack architecture. Every module, function, and component must include concise educational docstrings explaining **why** decisions were made, not just what was written.
- **Language**: Strictly **English** for all code, comments, documentation, schemas, and UI copy.
- **Simplicity First**: **No over-engineering**. Favor clean, readable, standardized patterns over complex abstractions. Write idiomatic code that is easy to reason about and maintain.

---

## 1. Security by Design & Shift-Left Rules (Priority #1)

1. **Zero Secrets in Code**:
   - Never hardcode API keys, database credentials, passwords, or JWT secrets in code or git.
   - Always load configuration via typed environment variables (`pydantic-settings` for backend, `process.env` for frontend).
   - Provide complete `.env.example` templates with non-production placeholder values.

2. **Authentication & Authorization**:
   - Use **Argon2id** (or strict **Bcrypt** with dynamic salt rounds >= 12) for password hashing.
   - Issue short-lived JWT Access Tokens with cryptographically secure expiration and separate Refresh Tokens.
   - Use `deps.get_current_active_user` in FastAPI to enforce authorization on all private endpoints.

3. **Input Validation & Sanitization**:
   - Strictly validate all incoming request bodies with **Pydantic v2 schemas** (backend) and **Zod** (frontend).
   - Disallow unknown fields where applicable (`extra = 'forbid'`).
   - Sanitize all text inputs (e.g. pasted course notes) to prevent injection or unexpected payload attacks.

4. **Zero Technical Data Leaks**:
   - Return clean, user-friendly error messages (e.g., `{"detail": "Invalid credentials"}`).
   - Never leak stack traces, SQL errors, internal file paths, or raw database exceptions to end users.
   - Use structured, centralized exception handlers in FastAPI.

5. **API Hardening & Middlewares**:
   - **Rate Limiting**: Enforce rate limits on authentication and AI generation endpoints (e.g., via `slowapi` or Redis token-bucket).
   - **CORS**: Explicitly configure allowed origins, methods, and headers. Never use wildcard `*` with credentials in production.
   - **Security Headers**: Set security headers (`Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security`).

6. **Database Security**:
   - Always use parameterized queries through SQLAlchemy ORM 2.0. No raw string interpolation in SQL queries.
   - Connection strings must always use SSL mode (`sslmode=require` in production).
   - Isolate database credentials and apply principle of least privilege.

---

## 2. Code Quality & Modularity Guidelines

### Backend (FastAPI / Python)
- Directory layout:
  ```
  backend/app/
  ├── api/          # Route handlers grouped by version (v1) & domain
  ├── core/         # Config, security helpers, database session & engine
  ├── models/       # SQLAlchemy ORM declarative models
  ├── schemas/      # Pydantic v2 request/response schemas
  └── services/     # External integrations (Gemini AI) and domain business logic
  ```
- **Async by Default**: Use `async def` for I/O-bound endpoints and async database sessions (`AsyncSession`).
- **Domain Exceptions**: Services must raise **pure Python domain exceptions** (e.g. `UserAlreadyExistsError`, `ResourceNotFoundError`), NEVER `HTTPException`. Controllers or centralized exception handlers map domain exceptions to appropriate HTTP status codes.
- **Swagger Security**: Interactive OpenAPI Swagger documentation (`/docs`, `/redoc`, `/openapi.json`) is enabled **only in development mode** (`ENVIRONMENT == "development"`) and strictly disabled by default in production to prevent API surface reconnaissance.

### Frontend (Next.js / TypeScript)
- Directory layout:
  ```
  frontend/src/
  ├── app/          # Next.js App Router pages & layouts
  ├── components/   # Reusable UI components (ui/, flashcards/, quiz/)
  ├── hooks/        # Reusable stateful hooks (useAuth, useTheme, useQuiz)
  ├── lib/          # API client with interceptors, utility helpers
  └── types/        # TypeScript type definitions & interfaces
  ```
- **Responsiveness**: Ensure design works on Mobile (<640px), Tablet (640-1024px), and Desktop (>1024px).
- **Theming**: Support Dark and Light modes using CSS variables and Tailwind classes.
- **Design Alignment**: Adhere to the colors and typography defined in `design_exports/DESIGN.md`.

---

## 3. Testing Requirements
- **Backend**: Every feature must have unit and integration tests using `pytest` and `httpx.AsyncClient`.
  - Auth test coverage: registration, login, token refresh, duplicate email protection, invalid passwords.
  - Route protections: unauthorized access attempts return 401/403.
  - AI schema parsing tests with mock Gemini payloads.
- **Frontend**: Component tests using React Testing Library and Vitest/Jest for critical interaction flows (flashcard flipping, quiz scoring).
- Run tests in CI before allowing merges or deployments.

---

## 4. Containerization & CI/CD Standards
- Multi-stage Docker builds to keep images small and minimal attack surface:
  - Run as non-root user (`USER nonroot` or `USER node`).
  - Cache dependencies efficiently.
- GitHub Actions workflows:
  - `ci.yml`: Automated linting (`ruff`, `eslint`), type checking (`tsc`), and test execution (`pytest`).
  - `deploy.yml`: Authenticate securely with Google Cloud using Service Accounts / Workload Identity, build container images, push to Artifact Registry, and deploy to Cloud Run.

---

## 5. Git Commit Standards: Gitmoji & Atomic Commits
- **Strict Rule**: **NEVER make one single huge commit**. Every commit must be atomic, focused, and organized by small logical units.
- **Gitmoji Convention**: Every commit message must begin with an appropriate Gitmoji followed by an imperative English description:
  - `:sparkles:` (`✨`) New feature
  - `:bug:` (`🐛`) Bug fix
  - `:lock:` (`🔒️`) Security improvement or hardening
  - `:recycle:` (`♻️`) Code refactoring (e.g. separating services/controllers)
  - `:test_tube:` (`🧪`) Adding or updating tests
  - `:memo:` (`📝`) Documentation additions or updates
  - `:wrench:` (`🔧`) Configuration files or build tooling
  - `:art:` (`🎨`) Improving structure / styling / formatting
  - `:construction:` (`🚧`) Work in progress
- Example:
  ```bash
  git commit -m ":lock: add rate limiting and disable swagger in production"
  git commit -m ":recycle: refactor auth and course logic into domain services"
  git commit -m ":test_tube: add pytest coverage for domain exception handling"
  ```
