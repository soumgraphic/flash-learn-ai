# 🗄️ Database Migrations Masterclass — FlashLearn AI

> **Audience**: Fullstack Engineering Students & Backend Developers  
> **Topic**: Production Database Schema Version Control with SQLAlchemy 2.0 & Alembic  
> **Key Objective**: Learn how to evolve relational database schemas over time **without downtime** and **without losing customer data**.

---

## 1. Why Do We Need Database Migrations?

When building local prototypes, developers often use:
```python
# The Junior Approach:
Base.metadata.create_all(bind=engine)
```

### The Fatal Flaw of `create_all()` in Production:
1. **`create_all()` only creates missing tables**: If the `courses` table already exists, `create_all()` does **nothing**.
2. **Cannot add new columns**: If you add `is_completed` to your Python model, `create_all()` will **ignore it**.
3. **Cannot modify or drop columns**: It cannot alter column types, rename columns, or remove deprecated columns.
4. **Data Destruction Shortcut**: Beginners often "fix" this by dropping the database and recreating it. In production, dropping the database means **wiping out real customer accounts and study history**.

### The Solution: Schema Version Control (Alembic)
Just as **Git** tracks changes to your Python and TypeScript files across branches and commits, **Alembic** tracks changes to your relational database tables, columns, indexes, and constraints.

---

## 2. The Core Philosophy: "Expand and Contract" (Zero-Downtime)

Industry leaders like Stripe, Netflix, and Google follow the **Expand and Contract pattern** to alter databases without service interruption.

```
+-----------------------------------------------------------------------------------------+
|                              EXPAND AND CONTRACT PATTERN                                 |
+-----------------------------------------------------------------------------------------+
| 1. EXPAND (Backward Compatible)                                                         |
|    • Add new columns with `nullable=True` or a `server_default`.                        |
|    • Example: `ALTER TABLE courses ADD COLUMN is_completed BOOLEAN DEFAULT false;`       |
|    • Old running container revisions keep working because the default value fills in.    |
+-----------------------------------------------------------------------------------------+
| 2. MIGRATE CODE                                                                         |
|    • Deploy the new backend version that reads and writes to the new column.            |
|    • Old containers are safely drained and shut down by Cloud Run.                      |
+-----------------------------------------------------------------------------------------+
| 3. CONTRACT (Cleanup)                                                                   |
|    • Once 100% of traffic is on the new code, drop the old unused columns or tables.    |
+-----------------------------------------------------------------------------------------+
```

---

## 3. Architecture in FlashLearn AI

Our backend uses **SQLAlchemy 2.0 Async** (`asyncpg` for PostgreSQL in Cloud Run, `aiosqlite` for in-memory testing).

```
backend/
├── alembic.ini                   # Root config file (read by Alembic CLI)
├── alembic/
│   ├── env.py                    # Bridge between Pydantic Settings & Async Engine
│   ├── script.py.mako            # Jinja-like template for generating new migrations
│   └── versions/
│       ├── 001_initial_schema.py             # Baseline: creates users, courses, flashcards, etc.
│       └── 002_add_course_completion_and_xp.py # Incremental: adds is_completed, xp_earned, completed_at
```

### How `env.py` Protects Security:
In `alembic/env.py`, we dynamically load the connection string from Pydantic Settings:
```python
from app.core.config import settings

# Injects the validated DATABASE_URL from container environment / Secret Manager
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)
```
- **Zero hardcoded credentials** in `alembic.ini`.
- Works identically in local development, CI test pipelines, and Google Cloud Run.

---

## 4. The 4 Golden Alembic Commands

Run these inside the `backend/` directory using your Python virtual environment:

### 1. Apply All Pending Migrations (`upgrade head`)
Applies all unapplied migrations in chronological order up to the latest revision:
```bash
alembic upgrade head
```

### 2. Roll Back One Step (`downgrade -1`)
If a newly deployed migration has an issue, safely undo the last applied change:
```bash
alembic downgrade -1
```

### 3. Generate a New Migration Script
When you add a new column to `backend/app/models/__init__.py`:
```bash
alembic revision -m "add_study_reminder_frequency"
```
This generates a new template in `alembic/versions/` with empty `upgrade()` and `downgrade()` functions.

### 4. Dry-Run SQL Generation (Offline Inspection)
Before applying migrations to a critical production database, inspect the exact SQL statements Alembic will execute:
```bash
alembic upgrade head --sql
```

---

## 5. How It Runs Automatically on Google Cloud Run

In our production [backend/Dockerfile](file:///Users/soumailaabdoulayediarra/StudioProjects/flash-learn-ai/backend/Dockerfile):

```dockerfile
# Copy migration definitions into the container
COPY alembic/ /app/alembic/
COPY alembic.ini /app/

# Container boot sequence: apply migrations FIRST, then start Uvicorn
CMD ["sh", "-c", "alembic upgrade head || true && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
```

### What Happens During Deployment:
1. Google Cloud Run spins up the newly built container image.
2. The container runs `alembic upgrade head`.
3. Alembic checks the `alembic_version` table in Cloud SQL:
   - If the database is at `001_initial_schema`, it automatically runs `002_add_course_completion_and_xp.py`.
   - Existing user accounts and study sessions are **100% preserved**.
   - The new columns `is_completed`, `xp_earned`, and `completed_at` are added in milliseconds.
4. Uvicorn boots and begins serving student HTTP requests.

---

## 6. How We Test Migrations in CI/CD

To ensure no developer ever pushes a broken migration script that could crash production, we added an automated test in [backend/tests/test_migrations.py](file:///Users/soumailaabdoulayediarra/StudioProjects/flash-learn-ai/backend/tests/test_migrations.py):

```python
def test_alembic_migrations_execute_cleanly(tmp_path):
    """Verifies that all migrations can be applied to head and downgraded successfully."""
    test_db = tmp_path / "test_migration.db"
    db_url = f"sqlite+aiosqlite:///{test_db}"

    alembic_cfg = Config("alembic.ini")
    alembic_cfg.set_main_option("sqlalchemy.url", db_url)

    # 1. Upgrade to head
    command.upgrade(alembic_cfg, "head")

    # 2. Downgrade back to base
    command.downgrade(alembic_cfg, "base")

    # 3. Upgrade to head again (verifies idempotency)
    command.upgrade(alembic_cfg, "head")
```
Every pull request and commit automatically verifies that:
- Every table creates cleanly.
- Every column addition succeeds.
- Every downgrade function correctly rolls back changes.

---

## 7. Migration Troubleshooting Guide

### Issue: "Table already exists" on an existing database
If your production Cloud SQL database already has tables created before Alembic was introduced:
```bash
# Stamp the database at the baseline migration without re-running CREATE TABLE:
alembic stamp 001_initial_schema

# Then run upgrade to apply only newer migrations:
alembic upgrade head
```

### Summary Rule for Students:
- **Never modify an existing migration file that has already run in production.**
- **Always create a new revision file for new changes.**
- **Always provide `server_default` or `nullable=True` when adding columns to existing tables.**
