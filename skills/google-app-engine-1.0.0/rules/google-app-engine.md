# Google App Engine Correction Rules (Go + Firestore)

Copy this file to `.claude/rules/google-app-engine.md` in your project.

## Primary Database Choice

**WRONG** - Defaulting to Cloud SQL without requirement:
```text
Use Cloud SQL by default.
```

**CORRECT** - Firestore is the default for this skill:
```text
Use Cloud Firestore as primary database unless relational SQL features are explicitly required.
```

---

## Firestore Client Initialization

**WRONG** - Creating clients per request:
```go
func handler(w http.ResponseWriter, r *http.Request) {
  client, _ := firestore.NewClient(r.Context(), "my-project")
  defer client.Close()
}
```

**CORRECT** - Reuse a single process-level client:
```go
var firestoreClient *firestore.Client

func initFirestore(ctx context.Context) error {
  c, err := firestore.NewClient(ctx, os.Getenv("GOOGLE_CLOUD_PROJECT"))
  if err != nil {
    return err
  }
  firestoreClient = c
  return nil
}
```

---

## Environment Detection

**WRONG** - Custom flag only:
```go
if os.Getenv("APP_ENV") == "production" {
  // assume GAE
}
```

**CORRECT** - Use GAE environment variable:
```go
isGAE := os.Getenv("GAE_APPLICATION") != ""
```

---

## Secrets in app.yaml

**WRONG** - Secrets in env_variables:
```yaml
env_variables:
  API_KEY: "plaintext"
```

**CORRECT** - Use Secret Manager:
```go
client, _ := secretmanager.NewClient(ctx)
name := fmt.Sprintf("projects/%s/secrets/%s/versions/latest", projectID, secretID)
resp, _ := client.AccessSecretVersion(ctx, &secretmanagerpb.AccessSecretVersionRequest{Name: name})
```

---

## Runtime

**WRONG** - Non-Go runtime:
```yaml
runtime: python312
```

**CORRECT** - Go runtime:
```yaml
runtime: go126
```

---

## HTTPS Enforcement

**WRONG** - Missing secure flag:
```yaml
handlers:
  - url: /.*
    script: auto
```

**CORRECT** - Enforce HTTPS:
```yaml
handlers:
  - url: /.*
    script: auto
    secure: always
```

---

## Firestore Query Indexes

**WRONG** - Ignoring composite index requirements:
```text
Query will always work in production.
```

**CORRECT** - Create required indexes when Firestore returns index links/errors:
```text
Follow Firestore index error link and deploy required composite index before release.
```
