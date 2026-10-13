# 🚀 Google Cloud & Cloud SQL (Firebase) Production Deployment Guide

This step-by-step runbook allows you or any developer to deploy **FlashLearn AI** completely from scratch to **Google Cloud Run** using a **Cloud SQL (Firebase Data Connect) PostgreSQL database**, adhering strictly to the **Principle of Least Privilege (PoLP)** and **Zero Secrets in Code**.

---

## 📋 Overview of Architecture & Identities

```
[ GitHub Actions CI/CD ]
         │ (Authenticates via dedicated Service Account: flashlearn-deployer)
         ▼
[ Google Artifact Registry ] ──> Stores Backend & Frontend Docker images
         │
         ▼
[ Google Cloud Run ]
  ├── flashlearn-api (FastAPI) ────> Connects via Unix Socket ────> [ Cloud SQL PostgreSQL ]
  └── flashlearn-web (Next.js) ───> Public Web UI
```

---

## Step 1: Open Google Cloud Shell & Define Variables

Open [Google Cloud Shell](https://shell.cloud.google.com) logged in with your GCP project owner account, and define your environment variables:

```bash
# Set your target Google Cloud Project ID
export PROJECT_ID="YOUR_PROJECT_ID"
export REGION="europe-west1"
export SA_NAME="flashlearn-deployer"
export SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

# Set current active project
gcloud config set project $PROJECT_ID
```

---

## Step 2: Enable Required Google Cloud APIs

By default, Google Cloud projects have services turned off. Enable the 4 required APIs in one command:

```bash
gcloud services enable \
    run.googleapis.com \
    artifactregistry.googleapis.com \
    secretmanager.googleapis.com \
    sqladmin.googleapis.com
```

---

## Step 3: Create the Dedicated CI/CD Service Account & Grant Roles

To avoid granting broad admin permissions to shared accounts, create a dedicated deployer service account with **only the 5 strictly required roles**:

```bash
# 1. Create the service account
gcloud iam service-accounts create $SA_NAME \
    --description="Dedicated CI/CD Service Account for FlashLearn GitHub Actions" \
    --display-name="FlashLearn CI/CD Deployer"

# 2. Grant Cloud Run Admin (Deploys services)
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/run.admin"

# 3. Grant Artifact Registry Writer (Pushes container images)
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/artifactregistry.writer"

# 4. Grant Secret Manager Secret Accessor (Reads secrets at deploy time)
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/secretmanager.secretAccessor"

# 5. Grant Service Account User (Acts on behalf of Cloud Run runtime)
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/iam.serviceAccountUser"

# 6. Grant Cloud SQL Client (Allows attaching Cloud SQL instances)
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/cloudsql.client"
```

---

## Step 4: Grant Cloud SQL & Secrets Permission to Cloud Run Runtime

When Cloud Run runs your Python container, it executes under Google's **Compute Engine default service account** (`PROJECT_NUMBER-compute@developer.gserviceaccount.com`). Grant it permission to read secrets and connect to Cloud SQL:

```bash
# Get the numeric project number
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
COMPUTE_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

# Grant Secret Access
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${COMPUTE_SA}" \
    --role="roles/secretmanager.secretAccessor"

# Grant Cloud SQL Connection
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${COMPUTE_SA}" \
    --role="roles/cloudsql.client"
```

---

## Step 5: Create Artifact Registry Docker Repository

Create the Docker image repository where GitHub Actions will push container images:

```bash
gcloud artifacts repositories create flashlearn-repo \
    --repository-format=docker \
    --location=$REGION \
    --description="FlashLearn AI Docker Repository"
```

---

## Step 6: Configure Cloud SQL (Firebase Data Connect) Instance

### A. Ensure Cloud SQL Admin API is Activated
```bash
gcloud services enable sqladmin.googleapis.com
```

### B. List Your Cloud SQL Instances
```bash
gcloud sql instances list
```
Note your **INSTANCE_NAME** and its full connection name (e.g., `PROJECT_ID:REGION:INSTANCE_NAME`).

### C. Set the Database Password for `postgres`


Replace "YourSuperSecurePassword123!" with your actual database password.

```bash
export INSTANCE_NAME="YOUR_INSTANCE_NAME"
export DB_PASSWORD="YourSuperSecurePassword123!"

gcloud sql users set-password postgres \
    --instance=$INSTANCE_NAME \
    --password=$DB_PASSWORD
```

---

## Step 7: Create Production Secrets in Google Secret Manager

Cloud Run injects these secrets into your container environment automatically at boot:

```bash
# 1. JWT Signing Key (Cryptographically random 32 bytes)
echo -n "$(openssl rand -hex 32)" | gcloud secrets create FLASHLEARN_SECRET_KEY \
    --data-file=- \
    --replication-policy="automatic" 2>/dev/null || echo -n "$(openssl rand -hex 32)" | gcloud secrets versions add FLASHLEARN_SECRET_KEY --data-file=-

# 2. Database Connection String (Unix Socket via Cloud SQL proxy)
# Format: postgresql+asyncpg://postgres:PASSWORD@/postgres?host=/cloudsql/PROJECT_ID:REGION:INSTANCE_NAME
INSTANCE_CONNECTION_NAME="${PROJECT_ID}:${REGION}:${INSTANCE_NAME}"

DB_URL="postgresql+asyncpg://postgres:${DB_PASSWORD}@/postgres?host=/cloudsql/${INSTANCE_CONNECTION_NAME}"

echo -n "$DB_URL" | gcloud secrets create FLASHLEARN_DATABASE_URL \
    --data-file=- \
    --replication-policy="automatic" 2>/dev/null || echo -n "$DB_URL" | gcloud secrets versions add FLASHLEARN_DATABASE_URL --data-file=-

# 3. Gemini API Key (Obtain from https://aistudio.google.com/app/apikey)
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets create FLASHLEARN_GEMINI_KEY \
    --data-file=- \
    --replication-policy="automatic" 2>/dev/null || true
```

---

## Step 8: Generate the Service Account Key JSON

Generate the authentication key for GitHub Actions:

```bash
gcloud iam service-accounts keys create flashlearn-key.json \
    --iam-account="${SA_EMAIL}"

# Print key content to screen so you can copy it
cat flashlearn-key.json
```

---

## Step 9: Configure GitHub Secrets (Zero Secrets in Git)

Open your GitHub Repository: **Settings ➔ Secrets and variables ➔ Actions ➔ New repository secret** and add:

| Secret Name | Secret Value | Notes |
| :--- | :--- | :--- |
| **`GCP_PROJECT_ID`** | `YOUR_PROJECT_ID` | Your Google Cloud project ID |
| **`GCP_SA_KEY`** | Paste the entire content of `flashlearn-key.json` | JSON format including `{ ... }` |
| **`CLOUDSQL_INSTANCE`** | `PROJECT_ID:REGION:INSTANCE_NAME` | Connection name of your Cloud SQL instance |

---

## Step 10: Deploy!

1. Open your GitHub Repository ➔ **Actions** tab.
2. Select **FlashLearn AI - Production Deployment to Google Cloud Run**.
3. Click **Run workflow**.

### What Happens Automatically:
1. GitHub authenticates to Google Cloud with the scoped key.
2. Builds and pushes the FastAPI backend container to Artifact Registry.
3. Deploys the backend container to Cloud Run attached to Cloud SQL socket.
4. Captures the generated live backend URL (`https://flashlearn-api-xxxx.run.app`).
5. Injects the backend URL into the Next.js frontend build.
6. Builds and deploys the frontend container to Cloud Run (`https://flashlearn-web-xxxx.run.app`).
7. SQLAlchemy 2.0 connects to your Cloud SQL database and creates all tables automatically on startup!
