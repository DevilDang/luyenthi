# Google App Engine Skill (Go + Firestore)

Deploy Go applications to Google App Engine Standard and Flexible environments with Cloud Firestore as the primary database.

## Auto-Trigger Keywords

This skill activates when discussing:

### Platform and Services
- Google App Engine, GAE, App Engine Standard, App Engine Flexible
- app.yaml, dispatch.yaml, cron.yaml, queue.yaml
- gcloud app deploy, gcloud app logs

### Firestore (Primary)
- Firestore, Cloud Firestore, NoSQL document database
- collection, document, transaction, composite index
- firestore client go, cloud.google.com/go/firestore
- firestore emulator

### Configuration
- runtime: go126, go 1.26
- instance_class, F1, F2, F4, F4_1G
- automatic_scaling, basic_scaling, manual_scaling
- handlers, static_dir, script: auto

### Storage and Secrets
- Cloud Storage static files, GS_BUCKET_NAME
- Secret Manager App Engine
- GOOGLE_CLOUD_PROJECT

### Common Errors
- 502 Bad Gateway App Engine
- missing Firestore index
- Firestore PermissionDenied
- cold start timeout
- request timeout 60 seconds

## Composable With

- **go**: net/http, gin, chi, grpc-go

## Use Cases

1. Deploy Go APIs to App Engine
2. Use Firestore as primary data store
3. Set up static files via App Engine or Cloud Storage
4. Configure scaling and health checks
5. Manage secrets with Secret Manager
6. Troubleshoot Firestore and App Engine runtime issues
