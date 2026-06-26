# Google App Engine Common Errors (Go + Firestore)

## Firestore Errors

### `rpc error: code = PermissionDenied`

**Cause**: App Engine service account does not have Firestore access.

**Solution**:
```bash
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:PROJECT_ID@appspot.gserviceaccount.com" \
  --role="roles/datastore.user"
```

---

### `FAILED_PRECONDITION: The query requires an index`

**Cause**: Composite index missing for query filters/order clauses.

**Solution**:
1. Open the index creation link from the error message.
2. Create the index.
3. Wait until index status is ready.

---

### `NotFound: The database (default) does not exist`

**Cause**: Firestore not initialized in the selected project.

**Solution**:
```bash
gcloud config set project PROJECT_ID
gcloud firestore databases create --location=us-central1 --type=firestore-native
```

---

## Memory and Timeout Errors

### `Exceeded soft memory limit of X MB`

**Cause**: Instance class too small.

**Solution**:
```yaml
instance_class: F2
# or F4 / F4_1G for heavier workloads
```

---

### `Process terminated because the request deadline was exceeded`

**Cause**: Request exceeded App Engine limits.

**Solution**:
- Keep handlers fast and non-blocking.
- Move long tasks to Cloud Tasks/Cloud Run jobs.
- Use caching for repeated reads.

---

## Deployment Errors

### `ERROR: (gcloud.app.deploy) PERMISSION_DENIED`

**Cause**: Missing deploy IAM roles.

**Solution**:
```bash
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="user:YOUR_EMAIL" \
  --role="roles/appengine.appAdmin"
```

---

### `Unable to fetch P4SA`

**Cause**: App Engine not initialized.

**Solution**:
```bash
gcloud app create --region=us-central1
```

---

## Static File Errors

### Static files return 404

**Cause**: Wrong handler order or missing directory.

**Solution**:
1. Put `/static` handler before `/.*/` catch-all.
2. Confirm `static/` exists in deployment artifact.

---

### `The file size exceeds the maximum allowed size of 32MB`

**Cause**: Asset too large for bundled static serving.

**Solution**: Serve large assets from Cloud Storage.

---

## 502 Bad Gateway

### Intermittent 502 errors

**Causes**:
1. Cold start latency
2. Panic in request path
3. Health checks failing

**Solutions**:
1. Add warmup endpoint and optimize startup.
2. Set `min_instances: 1` for latency-sensitive workloads.
3. Inspect logs: `gcloud app logs tail -s default`.

---

## Secret Manager Errors

### `PermissionDenied: Permission denied on resource`

**Cause**: Service account missing Secret Manager role.

**Solution**:
```bash
gcloud secrets add-iam-policy-binding SECRET_NAME \
  --member="serviceAccount:PROJECT_ID@appspot.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

### `NotFound: Secret not found`

**Cause**: Wrong project or secret does not exist.

**Solution**:
1. `gcloud config get project`
2. `gcloud secrets list`
3. Create missing secret if needed.
