# ⚡ FlashLearn AI — Student Architecture & Engineering Guide

> **Educational Project**: An AI-powered, gamified web application for students. Paste raw lecture notes to immediately extract:
> 1. **3 Key Concepts** (with real-world analogies)
> 2. **Interactive 3D Flashcards** (with card flip physics & spaced review)
> 3. **Interactive Gamified Quiz** (instant green/red feedback & confetti celebrations)

---

## 🎯 Architecture Overview

```
                                  [ Client Browser ]
                               (Desktop / Tablet / Mobile)
                                          │
                                          ▼
                      [ Next.js 14 App Router + Tailwind CSS ]
                             (Port 3000 / Google Cloud Run)
                                          │
                            REST API (JSON / Bearer JWT)
                                          ▼
                         [ FastAPI Backend (Python 3.11) ]
                             (Port 8000 / Google Cloud Run)
                                ├── Security Middleware (CORS, HSTS, Nosniff)
                                ├── SlowAPI Rate Limiting
                                └── Domain Exception Handlers
                                          │
                         ┌────────────────┴────────────────┐
                         ▼                                 ▼
            [ PostgreSQL 16 Database ]           [ Google Gemini AI ]
             (SQLAlchemy 2.0 Async)           (Structured JSON Extraction)
```

---

## 📖 Master Engineering Documentation

All architectural deep-dives, DevOps runbooks, and student masterclasses are organized under [`docs/`](docs/):

- 🚀 **[01 — Cloud Run Deployment](docs/01-CLOUD-RUN-DEPLOYMENT.md)**: Deploying to Google Cloud Run, connecting to Cloud SQL (Firebase Data Connect), and managing Secret Manager.
- 🗄️ **[02 — Database Migrations (Alembic)](docs/02-DATABASE-MIGRATIONS-ALEMBIC.md)**: Schema version control with Alembic, the zero-downtime "Expand & Contract" pattern, and automated container startup migrations.
- 🏗️ **[03 — Terraform (IaC) Masterclass](docs/03-TERRAFORM-INFRASTRUCTURE-AS-CODE.md)**: Infrastructure as Code with Terraform, GCS state locking, and cloud provisioning.
- 🎨 **[04 — UI/UX Design System](docs/04-UI-UX-DESIGN-SYSTEM.md)**: Semantic tokens, typography, and responsive component design.
- 🗺️ **[05 — Product Roadmap](docs/05-PROJECT-ROADMAP.md)**: Gamification mechanics, milestones, and architectural evolution.

---

## 🔒 Security by Design (Shift-Left Principles)

FlashLearn AI follows production industry standards:

1. **Zero Secrets in Source Code**:
   - Secrets are loaded at runtime through typed Pydantic Settings and environment variables.
   - In production (Google Cloud Run), secrets are securely injected from **Google Secret Manager**, never from committed `.env` files.
2. **Password Security**:
   - Salting and hashing powered by **Bcrypt** (`passlib`). Plaintext passwords are never saved or printed.
3. **Stateless Authentication (JWT)**:
   - Access tokens (30-min lifespan) signed with HMAC-SHA256.
   - Protected routes enforced via `get_current_user` FastAPI dependency.
4. **Zero Technical Data Leaks**:
   - Global exception handlers catch unhandled server errors and convert raw tracebacks into clean JSON messages (`{"detail": "..."}`) to prevent stack disclosure.
5. **Decoupled Domain Exceptions**:
   - Domain services (`AuthService`, `CourseService`) raise pure Python exceptions (`UserAlreadyExistsError`, `ResourceNotFoundError`). The HTTP router translates them to status codes (`400`, `404`).
6. **Production Swagger Lockdown**:
   - OpenAPI interactive documentation (`/docs`, `/redoc`, `/openapi.json`) is enabled strictly in development and disabled in production to eliminate attack surface reconnaissance.
7. **Container Hardening**:
   - Both backend and frontend Docker containers execute under unprivileged non-root users (`appuser` in Python, `node` in Next.js).

---

## 🚀 Quickstart Guide (Local Development)

### 1. Prerequisites
- **Docker & Docker Compose** (recommended for fullstack execution)
- Or locally: **Python 3.11+** and **Node.js 20+**

### 2. Run Entire Stack with Docker Compose (One Command)
```bash
# Clone the repository
git clone <your-repo-url>
cd flash-learn-ai

# Start PostgreSQL, FastAPI backend, and Next.js frontend
docker compose up --build
```
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8000](http://localhost:8000)
- **Swagger Docs (Dev Mode)**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### 3. Manual Local Development

#### Backend Setup
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Run automated tests
pytest tests/ -v

# Run linter
ruff check app/ tests/

# Start FastAPI development server
uvicorn app.main:app --reload --port 8000
```

#### Frontend Setup
```bash
cd frontend
npm install

# Build production bundle
npm run build

# Start Next.js development server
npm run dev
```

---

## 🧪 Automated Testing Strategy

Every feature is backed by automated tests:
```bash
cd backend
pytest tests/ -v
```
- `test_health_check`: Validates liveness probe used by container healthchecks.
- `test_user_registration_success`: Ensures passwords are never leaked in JSON responses.
- `test_duplicate_registration_fails`: Validates email uniqueness and domain exception mapping.
- `test_login_success_and_me_profile`: Tests JWT token issuing and bearer header validation.
- `test_generate_course_success`: Tests atomic generation of key concepts, flashcards, and quizzes + student XP progression.

---

## 📦 CI / CD Pipeline (GitHub Actions)

- **Continuous Integration (`.github/workflows/ci.yml`)**:
  - Automatically runs on all pushes and pull requests.
  - Executes `ruff check` for Python code style and security.
  - Runs the full `pytest` suite against an isolated in-memory database.
- **Continuous Deployment (`.github/workflows/deploy.yml`)**:
  - Authenticates securely with Google Cloud using Service Account credentials.
  - Builds minimal multi-stage Docker images.
  - Pushes images to Google Artifact Registry.
  - Deploys serverless containers to **Google Cloud Run** with auto-scaling and HTTPS.

---

## 🌿 Git Commit Standard: Gitmoji
All commits follow the atomic Gitmoji convention:
- `:sparkles:` (`✨`) New feature
- `:bug:` (`🐛`) Bug fix
- `:lock:` (`🔒️`) Security improvement or hardening
- `:recycle:` (`♻️`) Code refactoring
- `:test_tube:` (`🧪`) Tests additions or updates
- `:memo:` (`📝`) Documentation additions or updates
- `:wrench:` (`🔧`) Tooling or configuration files
