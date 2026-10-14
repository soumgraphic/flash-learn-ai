# 📚 FlashLearn AI — Student Engineering Documentation

Welcome to the engineering documentation for **FlashLearn AI**.  
These guides are designed as production-grade educational masterclasses, walking students step-by-step through the architecture, security, cloud deployment, and infrastructure of a modern fullstack AI application.

---

## 🗺️ Documentation Directory

| Guide | Description | Key Technologies |
| :--- | :--- | :--- |
| **[01 — Cloud Run Deployment](file:///Users/soumailaabdoulayediarra/StudioProjects/flash-learn-ai/docs/01-CLOUD-RUN-DEPLOYMENT.md)** | Step-by-step runbook for deploying backend and frontend to Google Cloud Run, connecting to Cloud SQL (Firebase Data Connect) using IAM least-privilege roles, and managing Secret Manager. | `Google Cloud Run`, `Cloud SQL`, `Secret Manager`, `IAM` |
| **[02 — Database Migrations (Alembic)](file:///Users/soumailaabdoulayediarra/StudioProjects/flash-learn-ai/docs/02-DATABASE-MIGRATIONS-ALEMBIC.md)** | Masterclass on relational schema version control. Explains why `create_all()` destroys or fails on live databases, the "Expand & Contract" zero-downtime migration pattern, and automated container startup migrations. | `Alembic`, `SQLAlchemy 2.0 Async`, `PostgreSQL`, `SQLite` |
| **[03 — Terraform Infrastructure as Code](file:///Users/soumailaabdoulayediarra/StudioProjects/flash-learn-ai/docs/03-TERRAFORM-INFRASTRUCTURE-AS-CODE.md)** | Infrastructure as Code (IaC) guide explaining the 3 golden commands (`init`, `plan`, `apply`), state locking with Google Cloud Storage (GCS), and automated provisioning of Cloud Run, Cloud SQL, and Secret Manager. | `Terraform`, `GCP Provider`, `GCS Remote State` |
| **[04 — UI/UX Design System](file:///Users/soumailaabdoulayediarra/StudioProjects/flash-learn-ai/docs/04-UI-UX-DESIGN-SYSTEM.md)** | Design tokens, color palette (Tailwind HSL semantic variables), typography rules, and component styling guidelines. | `Next.js 14`, `Tailwind CSS`, `Dark/Light Theming` |
| **[05 — Project Roadmap](file:///Users/soumailaabdoulayediarra/StudioProjects/flash-learn-ai/docs/05-PROJECT-ROADMAP.md)** | Product vision, feature milestones, gamification mechanics (XP, streaks, badges), and future engineering iterations. | `Roadmap`, `Gamification`, `Architecture` |

---

## 🚀 Quick Start for Students

1. **Local Development**:
   ```bash
   docker compose up --build
   ```
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:8000`
   - API Docs: `http://localhost:8000/docs` (available in development mode only)

2. **Backend Unit & Integration Tests**:
   ```bash
   cd backend
   .venv/bin/pytest
   ```

3. **Database Migration Dry-Run**:
   ```bash
   cd backend
   .venv/bin/alembic upgrade head --sql
   ```
