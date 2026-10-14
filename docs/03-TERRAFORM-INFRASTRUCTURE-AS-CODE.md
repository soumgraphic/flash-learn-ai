# 🏛️ Terraform & Infrastructure as Code (IaC) — Student Engineering Masterclass

> **Audience**: Students and Software Engineers learning DevOps, Fullstack Architecture, and Cloud Infrastructure.  
> **Topic**: What is Infrastructure as Code (IaC), why top tech companies use Terraform instead of manual clicks/commands, and how we will apply it to **FlashLearn AI** tomorrow.

---

## 📑 Table of Contents
1. [The Real-World Problem: "ClickOps" vs "Infrastructure as Code"](#1-the-real-world-problem-clickops-vs-infrastructure-as-code)
2. [Core Mental Model: How Terraform Works](#2-core-mental-model-how-terraform-works)
3. [The Terraform Lifecycle: The 3 Golden Commands](#3-the-terraform-lifecycle-the-3-golden-commands)
4. [FlashLearn AI Infrastructure Architecture Diagram](#4-flashlearn-ai-infrastructure-architecture-diagram)
5. [The Tomorrow Blueprint: File Structure & Code Breakdown](#5-the-tomorrow-blueprint-file-structure--code-breakdown)
6. [Best Practices: State Management & Zero Secrets](#6-best-practices-state-management--zero-secrets)
7. [Glossary of Key Terms](#7-glossary-of-key-terms)

---

## 1. The Real-World Problem: "ClickOps" vs "Infrastructure as Code"

When building web applications, you need infrastructure: databases, servers, container registries, firewalls, and IAM service accounts.

There are three ways developers create this:

### ❌ Level 1: "ClickOps" (Manual Web Console)
- Clicking through the Google Cloud or AWS web console to create databases, assign roles, and make service accounts.
- **Why it fails**: It is impossible to remember 45 distinct mouse clicks. One developer forgets to check a "Require SSL" box, causing a security breach or production downtime. Zero traceability.

### ⚠️ Level 2: Ad-Hoc Shell Scripts (`gcloud ...`)
- Running imperative bash commands one after another.
- **Why it is brittle**: Scripts are **imperative**. If step 4 fails midway through, running the script again might crash because step 1 already exists (`Error: resource already exists`). It lacks state tracking.

### 🌟 Level 3: Infrastructure as Code (Terraform)
- Writing **declarative code** (`.tf` files) that specifies the desired final state of your infrastructure.
- You don't tell the cloud *how* to build it step by step; you simply declare:  
  *"I want a PostgreSQL database named `flashlearn_db` with SSL enabled and a service account with `roles/run.admin`."*
- Terraform inspects the real cloud, calculates the mathematical difference (diff), and safely converges the cloud to match your code.

---

## 2. Core Mental Model: How Terraform Works

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Terraform Workflow                              │
└────────────────────────────────────────────────────────────────────────┘

  [ Your Code (.tf) ]            [ Google Cloud Platform ]
           │                                 │
           │                                 │
           ▼                                 ▼
   [ What you WANT ]              [ What ACTUALLY EXISTS ]
           │                                 │
           └───────────────┬─────────────────┘
                           │
                           ▼
                  [ terraform plan ]
                           │
             (Computes the exact diff)
             + Resources to CREATE
             ~ Resources to MODIFY
             - Resources to DESTROY
                           │
                           ▼
                  [ terraform apply ]
                           │
             (Executes changes safely)
                           │
                           ▼
                [ terraform.tfstate ]
            (Record of truth saved in Git/Cloud)
```

### The HashiCorp Configuration Language (HCL)
Terraform uses **HCL**, a human-readable language built around two main blocks:
- **`provider`**: Tells Terraform which cloud to connect to (e.g. Google Cloud, AWS, Azure, GitHub, Cloudflare).
- **`resource`**: The piece of cloud infrastructure you want to create (e.g. a service account, a Cloud Run service, an Artifact Registry).

---

## 3. The Terraform Lifecycle: The 3 Golden Commands

Every engineer in the industry uses these 3 sequential steps:

### 1. `terraform init`
- **What it does**: Reads your `.tf` files, identifies providers (e.g. `google`), and downloads the required provider plugins into a `.terraform/` directory.
- **When to run**: Once when setting up a repository or when adding a new provider.

### 2. `terraform plan`
- **What it does**: A "dry run". Terraform queries the Google Cloud API, compares it against your local files, and outputs a formatted preview of exactly what will happen.
- **Safety guarantee**: It modifies **nothing**. It lets you and your team review changes in PRs before anything touches real production.

### 3. `terraform apply`
- **What it does**: Prompts for confirmation (`yes`), then calls Google Cloud's APIs in parallel to provision the infrastructure in seconds.

---

## 4. FlashLearn AI Infrastructure Architecture Diagram

Tomorrow, we will use Terraform to manage this entire production topology in Google Cloud:

```
                            [ Google Cloud Project ]
                                       │
        ┌──────────────────────────────┼──────────────────────────────┐
        ▼                              ▼                              ▼
 [ Google Artifact Registry ]   [ Google Secret Manager ]   [ Cloud SQL (Firebase) ]
 (Docker Container Images)      ├── FLASHLEARN_SECRET_KEY   (PostgreSQL 16)
  ├── flashlearn-api:latest     ├── FLASHLEARN_DATABASE_URL
  └── flashlearn-web:latest     └── FLASHLEARN_GEMINI_KEY
        ▲                              ▲                              ▲
        │                              │                              │
        │                       (Reads Secrets)                (Unix Socket)
        │                              │                              │
        └────────────────────── [ Cloud Run ] ────────────────────────┘
                          ├── flashlearn-api (FastAPI)
                          └── flashlearn-web (Next.js)
                                       ▲
                                       │ (Deploys containers via CI/CD)
                       [ Service Account: flashlearn-deployer ]
```

---

## 5. The Tomorrow Blueprint: File Structure & Code Breakdown

Tomorrow, we will create a dedicated `terraform/` folder in the root of the repository:

```text
flash-learn-ai/
├── backend/
├── frontend/
├── .github/workflows/
└── terraform/
    ├── provider.tf      # Configures Google Cloud provider & version
    ├── variables.tf     # Configurable inputs (project_id, region)
    ├── iam.tf           # Service Accounts & Role Bindings (PoLP)
    ├── registry.tf      # Artifact Registry Docker repo
    ├── secrets.tf       # Secret Manager resource definitions
    ├── outputs.tf       # Outputs Service Account emails & Registry URLs
    └── terraform.tfvars # Local non-committed variables (e.g. your project id)
```

### Detailed Component Previews

#### A. `provider.tf` (Connecting to Google Cloud)
```hcl
terraform {
  required_version = ">= 1.5.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}
```

#### B. `variables.tf` (Reusable Parameters)
```hcl
variable "project_id" {
  description = "The Google Cloud Project ID"
  type        = string
}

variable "region" {
  description = "Default Google Cloud deployment region"
  type        = string
  default     = "europe-west1"
}
```

#### C. `iam.tf` (Applying Principle of Least Privilege)
Notice how clean this is compared to running individual shell commands:
```hcl
# 1. Create Dedicated CI/CD Service Account
resource "google_service_account" "deployer" {
  account_id   = "flashlearn-deployer"
  display_name = "FlashLearn CI/CD Deployer"
  description  = "Scoped service account for GitHub Actions deployment"
}

# 2. Assign the 5 Required Roles Dynamically
resource "google_project_iam_member" "deployer_roles" {
  for_each = toset([
    "roles/run.admin",
    "roles/artifactregistry.writer",
    "roles/secretmanager.secretAccessor",
    "roles/iam.serviceAccountUser",
    "roles/cloudsql.client"
  ])

  project = var.project_id
  role    = each.value
  member  = "serviceAccount:${google_service_account.deployer.email}"
}
```

#### D. `registry.tf` (Docker Container Storage)
```hcl
resource "google_artifact_registry_repository" "flashlearn_repo" {
  location      = var.region
  repository_id = "flashlearn-repo"
  description   = "Docker container repository for FlashLearn AI"
  format        = "DOCKER"
}
```

#### E. `secrets.tf` (Secret Manager Placeholders)
```hcl
resource "google_secret_manager_secret" "jwt_secret" {
  secret_id = "FLASHLEARN_SECRET_KEY"
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret" "db_url" {
  secret_id = "FLASHLEARN_DATABASE_URL"
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret" "gemini_key" {
  secret_id = "FLASHLEARN_GEMINI_KEY"
  replication {
    auto {}
  }
}
```

---

## 6. Best Practices: State Management & Zero Secrets

### Rule 1: NEVER Commit Secrets into `.tf` Files
- Never hardcode real passwords or API keys inside Terraform code.
- Create the Secret Manager **containers/placeholders** using Terraform, and populate the sensitive values through Google Cloud Console, Google Secret Manager CLI, or environment variables.

### Rule 2: NEVER Commit `.tfstate` to Public Git
- When Terraform runs, it creates a `terraform.tfstate` file recording the metadata of your cloud resources.
- In `.gitignore`:
  ```gitignore
  # Terraform local state files
  *.tfstate
  *.tfstate.*
  .terraform/
  .terraform.lock.hcl
  terraform.tfvars
  ```
- **Enterprise Standard**: In production teams, the state file is stored securely in a private **Google Cloud Storage (GCS) Bucket** with encryption and object versioning (`backend "gcs" { ... }`).

---

## 7. Glossary of Key Terms

| Term | Plain English Definition |
| :--- | :--- |
| **IaC (Infrastructure as Code)** | Writing machine-readable definition files rather than manually configuring hardware or cloud web consoles. |
| **Declarative vs Imperative** | **Declarative** (*Terraform*) describes *what* you want the end result to be. **Imperative** (*Bash*) gives step-by-step instructions on *how* to do it. |
| **Provider** | A plugin that translates Terraform configurations into API calls for a specific platform (e.g. Google Cloud, AWS). |
| **State File (`.tfstate`)** | Terraform's database mapping your code to the actual cloud resources that exist in real life. |
| **Drift** | When someone manually changes a cloud setting in the web console, creating a difference between the real cloud and your code. Terraform detects and fixes drift. |
| **Idempotency** | Running `terraform apply` 100 times produces the exact same result as running it once without duplicating or breaking resources. |

---

## 🎯 Tomorrow's Roadmap & Action Plan
1. Install Terraform CLI (`brew install terraform` on macOS or via Cloud Shell).
2. Create the `terraform/` directory and implement the `.tf` blueprint.
3. Run `terraform init` and `terraform plan` to preview resources.
4. Execute `terraform apply` to provision the FlashLearn AI Google Cloud infrastructure cleanly in under 60 seconds!
