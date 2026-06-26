---
name: google-app-engine
description: |
  Deploy Go applications to Google App Engine Standard/Flexible. Covers app.yaml configuration, Cloud Firestore as the primary database, Cloud Storage static assets, scaling settings, and environment variables.

  Use when: deploying to App Engine, configuring app.yaml for Go, building with Firestore, setting up static file serving, or troubleshooting 502 errors, cold starts, and memory limits.
metadata:
  mcpmarket-version: 1.0.0
---
# Google App Engine (Go + Firestore)

**Status**: Production Ready
**Last Updated**: 2026-06-14
**Dependencies**: Google Cloud SDK (gcloud CLI), Go 1.26
**Skill Version**: 1.0.0

---

## Quick Start (10 Minutes)

### 1. Prerequisites

```bash
# Install Google Cloud SDK
brew install google-cloud-sdk

# Authenticate and select project
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable appengine.googleapis.com
gcloud services enable firestore.googleapis.com
gcloud services enable secretmanager.googleapis.com
```

### 2. Create app.yaml (Go 1.26)

```yaml
runtime: go126
instance_class: F2

env_variables:
  APP_ENV: "production"
  GOOGLE_CLOUD_PROJECT: "your-project-id"

handlers:
  - url: /static
    static_dir: static/
    secure: always

  - url: /.*
    script: auto
    secure: always

automatic_scaling:
  min_instances: 0
  max_instances: 10
  target_cpu_utilization: 0.65
```

### 3. Firestore Client Setup (Primary Database)

```go
package db

import (
	"context"
	"os"

	"cloud.google.com/go/firestore"
)

func NewFirestore(ctx context.Context) (*firestore.Client, error) {
	projectID := os.Getenv("GOOGLE_CLOUD_PROJECT")
	return firestore.NewClient(ctx, projectID)
}
```

### 4. Deploy

```bash
gcloud app deploy
gcloud app logs tail -s default
```

---

## Standard vs Flexible Environment

### Standard Environment (Recommended)

| Aspect | Standard |
|--------|----------|
| Startup | Fast |
| Scaling | Scale to zero |
| Pricing | Pay per request |
| Runtime | go126 |
| Instance Classes | F1, F2, F4, F4_1G |
| Max Request | 60 seconds |

```yaml
runtime: go126
instance_class: F2
```

### Flexible Environment

| Aspect | Flexible |
|--------|----------|
| Startup | Slower |
| Scaling | Min 1 instance |
| Pricing | Per-hour VM |
| Runtime | Custom (Docker or Go runtime) |
| Max Request | 60 minutes |

```yaml
runtime: go
env: flex

runtime_config:
  operating_system: "ubuntu22"
  runtime_version: "1.26"
```

---

## Firestore Data Modeling

### Collection and Document Pattern

```go
package model

type User struct {
	Email     string `firestore:"email"`
	Name      string `firestore:"name"`
	CreatedAt int64  `firestore:"created_at"`
}
```

```go
func CreateUser(ctx context.Context, client *firestore.Client, id string, user User) error {
	_, err := client.Collection("users").Doc(id).Set(ctx, user)
	return err
}

func GetUser(ctx context.Context, client *firestore.Client, id string) (*User, error) {
	snap, err := client.Collection("users").Doc(id).Get(ctx)
	if err != nil {
		return nil, err
	}
	var user User
	if err := snap.DataTo(&user); err != nil {
		return nil, err
	}
	return &user, nil
}
```

### Query Example

```go
func ListUsersByEmail(ctx context.Context, client *firestore.Client, email string) ([]User, error) {
	iter := client.Collection("users").Where("email", "==", email).Documents(ctx)
	defer iter.Stop()

	var out []User
	for {
		doc, err := iter.Next()
		if err != nil {
			if err.Error() == "no more items in iterator" {
				break
			}
			return nil, err
		}
		var u User
		if err := doc.DataTo(&u); err != nil {
			return nil, err
		}
		out = append(out, u)
	}
	return out, nil
}
```

---

## Firestore Transactions

```go
func IncrementLoginCount(ctx context.Context, client *firestore.Client, userID string) error {
	ref := client.Collection("users").Doc(userID)
	return client.RunTransaction(ctx, func(ctx context.Context, tx *firestore.Transaction) error {
		doc, err := tx.Get(ref)
		if err != nil {
			return err
		}
		count, _ := doc.DataAt("login_count")
		n, _ := count.(int64)
		return tx.Update(ref, []firestore.Update{{Path: "login_count", Value: n + 1}})
	})
}
```

---

## Optional: Cloud SQL (Alternative)

Use Cloud SQL only if you need relational joins/strict SQL workflows. Firestore is the default recommendation for this skill.

---

## Static Files with Cloud Storage

```go
package static

import (
	"context"
	"os"

	"cloud.google.com/go/storage"
)

func NewStorageClient(ctx context.Context) (*storage.Client, string, error) {
	bucket := os.Getenv("GS_BUCKET_NAME")
	client, err := storage.NewClient(ctx)
	return client, bucket, err
}
```

---

## Environment Variables and Secrets

```yaml
env_variables:
  APP_ENV: "production"
  LOG_LEVEL: "info"
```

```go
package secrets

import (
	"context"
	"fmt"
	"os"

	secretmanager "cloud.google.com/go/secretmanager/apiv1"
	secretmanagerpb "cloud.google.com/go/secretmanager/apiv1/secretmanagerpb"
)

func GetSecret(ctx context.Context, secretID string) (string, error) {
	project := os.Getenv("GOOGLE_CLOUD_PROJECT")
	name := fmt.Sprintf("projects/%s/secrets/%s/versions/latest", project, secretID)

	client, err := secretmanager.NewClient(ctx)
	if err != nil {
		return "", err
	}
	defer client.Close()

	resp, err := client.AccessSecretVersion(ctx, &secretmanagerpb.AccessSecretVersionRequest{Name: name})
	if err != nil {
		return "", err
	}
	return string(resp.Payload.Data), nil
}
```

---

## Scaling Configuration

```yaml
automatic_scaling:
  min_instances: 0
  max_instances: 10
  target_cpu_utilization: 0.65
  max_concurrent_requests: 80
```

---

## Known Issues Prevention

1. Firestore permission denied: missing IAM role for service account.
2. Missing Firestore index: query fails and requires composite index.
3. 502 on startup: slow initialization or panic in handler.
4. Memory errors: instance class too small.
5. Request timeout: long synchronous requests.
6. Secret leakage: credentials in `app.yaml` instead of Secret Manager.

---

## Deployment Commands

```bash
gcloud app deploy
gcloud app deploy app.yaml --service=api
gcloud app deploy --version=v2 --no-promote
gcloud app services set-traffic default --splits=v1=0.5,v2=0.5
gcloud app versions migrate v2
gcloud app logs tail -s default
```

---

## Common Patterns

```go
package main

import "net/http"

func main() {
	http.HandleFunc("/_ah/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	})

	http.HandleFunc("/_ah/warmup", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("warmed"))
	})

	http.ListenAndServe(":8080", nil)
}
```

```yaml
inbound_services:
  - warmup
```

---

## Local Development

```bash
# Firestore local emulator (optional)
gcloud emulators firestore start --host-port=127.0.0.1:8787

# App local run
go mod tidy
go run ./cmd/server
```

```go
isGAE := os.Getenv("GAE_APPLICATION") != ""
```

---

## Bundled Resources

- `templates/app.yaml` - Standard App Engine Go template
- `templates/app-flex.yaml` - Flexible App Engine Go template
- `templates/go.mod` - Go module dependencies (Firestore-first)
- `references/common-errors.md` - Error messages and solutions

---

## Official Documentation

- App Engine Go: https://cloud.google.com/appengine/docs/standard/go
- Firestore Go client: https://pkg.go.dev/cloud.google.com/go/firestore
- Firestore indexes: https://cloud.google.com/firestore/docs/query-data/index-overview
- Secret Manager: https://cloud.google.com/secret-manager/docs

---

## Dependencies

```go
module your-app

go 1.26

require (
	cloud.google.com/go/firestore v1.17.0
	cloud.google.com/go/secretmanager v1.14.0
	cloud.google.com/go/storage v1.43.0
)
```

---

## Production Checklist

- [ ] `runtime: go126` configured
- [ ] Firestore API enabled in project
- [ ] App Engine service account has Firestore access
- [ ] Required composite indexes created
- [ ] Health endpoint (`/_ah/health`) configured
- [ ] HTTPS enforced (`secure: always`)
- [ ] Secrets in Secret Manager, not `app.yaml`

---

**Last verified**: 2026-06-14 | **Skill version**: 1.0.0
