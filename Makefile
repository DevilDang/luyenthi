PROJECT_ID ?= $(shell grep GOOGLE_CLOUD_PROJECT backend/.env | cut -d= -f2)

.PHONY: help setup dev-backend dev-frontend emulator build deploy deploy-frontend deploy-all logs

# ── Default ────────────────────────────────────────────────────────────────────
help:
	@echo ""
	@echo "  make setup          Install all dependencies"
	@echo "  make dev-backend    Run the Go API server (loads backend/.env)"
	@echo "  make dev-frontend   Run the Vite dev server"
	@echo "  make emulator       Start the Firestore local emulator"
	@echo "  make build          Build frontend into backend/static/"
	@echo "  make deploy         Build + deploy backend to Google App Engine"
	@echo "  make deploy-frontend  Build + deploy frontend to Firebase Hosting"
	@echo "  make deploy-all     Deploy both frontend (Firebase) and backend (App Engine)"
	@echo "  make logs           Tail live App Engine logs"
	@echo ""

# ── Setup ──────────────────────────────────────────────────────────────────────
setup:
	@echo "→ Installing backend dependencies…"
	cd backend && go mod tidy
	@echo "→ Installing frontend dependencies…"
	cd frontend && npm install
	@echo "→ Copying backend env template…"
	@test -f backend/.env || cp backend/.env.example backend/.env && \
		echo "  Created backend/.env — fill in your values before running." || true
	@echo "→ Copying frontend env template…"
	@test -f frontend/.env.local || cp frontend/.env.production frontend/.env.local && \
		echo "  Created frontend/.env.local — fill in VITE_GOOGLE_CLIENT_ID." || true
	@echo ""
	@echo "Setup complete. Edit backend/.env and frontend/.env.local, then run:"
	@echo "  make dev-backend    (terminal 1)"
	@echo "  make dev-frontend   (terminal 2)"

# ── Local development ──────────────────────────────────────────────────────────
dev-backend:
	@echo "→ Starting API server on :8080 …"
	cd backend && go run ./cmd/server

dev-frontend:
	@echo "→ Starting Vite dev server on :5173 …"
	cd frontend && npm run dev

emulator:
	@echo "→ Starting Firestore emulator on 127.0.0.1:8787 …"
	@echo "  Set FIRESTORE_EMULATOR_HOST=127.0.0.1:8787 in backend/.env to use it."
	gcloud emulators firestore start --host-port=127.0.0.1:8787

# ── Production build & deploy ──────────────────────────────────────────────────
build:
	@echo "→ Building frontend for production…"
	cd frontend && npm run build
	@echo "→ Copying dist/ into backend/static/…"
	rm -rf backend/static
	cp -r frontend/dist backend/static
	@echo "Build complete → backend/static/"

deploy: build
	@echo "→ Deploying to App Engine (project: $(PROJECT_ID))…"
	cd backend && gcloud app deploy --quiet --project=$(PROJECT_ID)
	@echo ""
	@echo "Deployed! Open: https://$(PROJECT_ID).appspot.com"

deploy-frontend:
	@echo "→ Building frontend for Firebase Hosting…"
	cd frontend && npm run build
	@echo "→ Deploying to Firebase Hosting…"
	firebase deploy --only hosting
	@echo ""
	@echo "Deployed! Open: https://$(PROJECT_ID).web.app"

deploy-all: deploy-frontend
	@echo "→ Deploying backend to App Engine (project: $(PROJECT_ID))…"
	cd backend && gcloud app deploy --quiet --project=$(PROJECT_ID)
	@echo ""
	@echo "All done!"

logs:
	gcloud app logs tail -s default --project=$(PROJECT_ID)
