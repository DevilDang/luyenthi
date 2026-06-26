# LuyenThi — Exam Preparation Platform

A full-stack exam preparation application built with React (frontend) and Go on Google App Engine (backend), using Cloud Firestore as the database.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Google Cloud & OAuth Setup](#google-cloud--oauth-setup)
- [Local Development](#local-development)
- [Deploy to Google App Engine](#deploy-to-google-app-engine)
- [First Admin User](#first-admin-user)

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Go | 1.22+ | https://go.dev/dl |
| Node.js | 18+ | https://nodejs.org |
| Google Cloud SDK | latest | `brew install google-cloud-sdk` |
| Git | any | — |

Authenticate the Cloud SDK once:

```bash
gcloud auth login
gcloud auth application-default login
```

---

## Project Structure

```
luyenthi/
├── backend/                  # Go API server (Google App Engine)
│   ├── app.yaml              # App Engine configuration
│   ├── go.mod
│   ├── cmd/server/main.go    # Entry point & router
│   └── internal/
│       ├── auth/             # Google token verification + JWT
│       ├── config/           # Environment config
│       ├── db/               # Firestore client
│       ├── grading/          # Auto-grading logic
│       ├── handlers/         # HTTP handlers (auth, user, exam, admin)
│       ├── middleware/        # JWT auth + admin-only middleware
│       ├── models/           # Firestore document models
│       └── response/         # JSON response helpers
└── frontend/                 # React + Vite SPA
    ├── index.html
    ├── vite.config.js        # Dev proxy → backend :8080
    └── src/
        ├── api/              # Axios API clients
        ├── components/       # MathRenderer (KaTeX), QuestionCard, Navbar…
        ├── context/          # AuthContext (JWT + user)
        ├── hooks/            # useTimer
        ├── pages/            # Login, Home, ExamList, ExamPage, Admin…
        └── router/           # React Router config
```

---

## Google Cloud & OAuth Setup

### 1. Create a GCP project

```bash
gcloud projects create YOUR_PROJECT_ID --name="LuyenThi"
gcloud config set project YOUR_PROJECT_ID
```

### 2. Enable required APIs

```bash
gcloud services enable \
  appengine.googleapis.com \
  firestore.googleapis.com \
  secretmanager.googleapis.com
```

### 3. Initialize App Engine

```bash
gcloud app create --region=us-central1
```

### 4. Create Firestore database

```bash
gcloud firestore databases create \
  --location=us-central1 \
  --type=firestore-native
```

### 5. Create Google OAuth credentials

1. Go to [Google Cloud Console → APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials).
2. Click **Create Credentials → OAuth 2.0 Client ID**.
3. Application type: **Web application**.
4. Add **Authorized JavaScript origins**:
   - `http://localhost:5173` (local dev)
   - `https://YOUR_PROJECT_ID.appspot.com` (production)
5. Add **Authorized redirect URIs** (same URLs).
6. Copy the **Client ID** — you will need it for both frontend and backend.

### 6. Store secrets in Secret Manager

```bash
# JWT signing key (generate a random 32+ character string)
echo -n "$(openssl rand -base64 32)" | \
  gcloud secrets create JWT_SECRET --data-file=-

# Google OAuth Client ID
echo -n "YOUR_GOOGLE_CLIENT_ID" | \
  gcloud secrets create GOOGLE_CLIENT_ID --data-file=-
```

Grant the App Engine service account access:

```bash
PROJECT_ID=$(gcloud config get-value project)
SA="${PROJECT_ID}@appspot.gserviceaccount.com"

gcloud secrets add-iam-policy-binding JWT_SECRET \
  --member="serviceAccount:${SA}" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding GOOGLE_CLIENT_ID \
  --member="serviceAccount:${SA}" \
  --role="roles/secretmanager.secretAccessor"
```

---

## Local Development

### Backend

```bash
cd backend

# Download dependencies
go mod tidy

# Run with environment variables
JWT_SECRET="local-dev-secret" \
GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID" \
GOOGLE_CLOUD_PROJECT="YOUR_PROJECT_ID" \
ALLOWED_ORIGINS="http://localhost:5173" \
go run ./cmd/server
```

The API server starts on **http://localhost:8080**.

#### Optional: Firestore emulator (no GCP billing)

```bash
# In a separate terminal
# gcloud emulators firestore start --host-port=127.0.0.1:8787
firebase emulators:start

# Then set the emulator env var before starting the backend
export FIRESTORE_EMULATOR_HOST="127.0.0.1:8787"
```

### Frontend

```bash
cd frontend

# Copy and fill in environment variables
cp .env.example .env
```

Edit `.env`:

```env
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
VITE_API_BASE_URL=
```

> `VITE_API_BASE_URL` is left empty so Vite's dev proxy forwards `/api/*` requests to `http://localhost:8080` automatically.

```bash
npm install
npm run dev
```

The app opens at **http://localhost:5173**.

### Verify it works

1. Open http://localhost:5173 — you should see the login page.
2. Click **Continue with Google** and sign in.
3. You'll land on the dashboard.

---

## Deploy to Google App Engine

### 1. Build the frontend

```bash
cd frontend
npm run build
# Output: frontend/dist/
```

### 2. Copy the frontend build into the backend static directory

```bash
cp -r frontend/dist backend/static
```

### 3. Update `backend/app.yaml`

Fill in your real project ID and frontend domain:

```yaml
env_variables:
  APP_ENV: "production"
  GOOGLE_CLOUD_PROJECT: "YOUR_PROJECT_ID"
  ALLOWED_ORIGINS: "https://YOUR_PROJECT_ID.appspot.com"
```

> `JWT_SECRET` and `GOOGLE_CLIENT_ID` are loaded from Secret Manager at startup — do **not** put them in `app.yaml`.

Add a static file handler **above** the catch-all so the React app is served directly:

```yaml
handlers:
  - url: /static
    static_dir: static/assets
    secure: always
    expiration: "7d"

  - url: /
    static_files: static/index.html
    upload: static/index.html
    secure: always

  - url: /.*
    script: auto
    secure: always
```

### 4. Load secrets at startup

Update `backend/internal/config/config.go` to load from Secret Manager in production, or pass secrets via environment variables using Cloud Run / Cloud Tasks if you prefer that pattern. For App Engine, the simplest approach is to read them directly in `main.go`:

```go
// In cmd/server/main.go — add before config.Load()
// (only in production; local dev uses env vars)
if os.Getenv("APP_ENV") == "production" {
    loadSecretToEnv(ctx, cfg.ProjectID, "JWT_SECRET")
    loadSecretToEnv(ctx, cfg.ProjectID, "GOOGLE_CLIENT_ID")
}
```

A helper `loadSecretToEnv` calls the Secret Manager API and sets `os.Setenv`. See `skills/google-app-engine-1.0.0/SKILL.md` for a complete `GetSecret` implementation.

### 5. Deploy

```bash
cd backend
gcloud app deploy --quiet
```

Watch the build and deployment log. On success:

```bash
gcloud app browse
# Opens https://YOUR_PROJECT_ID.appspot.com
```

### 6. Tail live logs

```bash
gcloud app logs tail -s default
```

---

## First Admin User

Firestore has no admin user by default. After deploying, promote yourself manually:

```bash
# Replace YOUR_GOOGLE_SUB with the `sub` value from your Google ID token
# (visible in the browser's localStorage → token → decode at jwt.io)

gcloud firestore documents update \
  projects/YOUR_PROJECT_ID/databases/'(default)'/documents/users/YOUR_GOOGLE_SUB \
  --fields role=admin
```

Or use the [Firestore console](https://console.cloud.google.com/firestore) to edit the `role` field on your user document to `"admin"`.

---

## Firestore Indexes

The queries used by the app require composite indexes. Create them once:

```bash
gcloud firestore indexes composite create \
  --collection-group=exams \
  --field-config field-path=is_published,order=ASCENDING \
  --field-config field-path=grade_level,order=ASCENDING \
  --field-config field-path=subject,order=ASCENDING

gcloud firestore indexes composite create \
  --collection-group=submissions \
  --field-config field-path=user_id,order=ASCENDING \
  --field-config field-path=submitted_at,order=DESCENDING
```

Alternatively, the first query that needs an index will return an error with a direct link to create it in the console.

---

## Environment Variable Reference

### Backend

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GOOGLE_CLOUD_PROJECT` | Yes | — | GCP project ID |
| `JWT_SECRET` | Yes | `dev-secret-…` | HS256 signing key |
| `GOOGLE_CLIENT_ID` | Yes | — | OAuth 2.0 client ID |
| `ALLOWED_ORIGINS` | No | `http://localhost:5173` | Comma-separated CORS origins |
| `PORT` | No | `8080` | HTTP listen port |

### Frontend

| Variable | Description |
|----------|-------------|
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID (same value as backend) |
| `VITE_API_BASE_URL` | API base URL (empty in dev, set to App Engine URL in CI/CD) |
