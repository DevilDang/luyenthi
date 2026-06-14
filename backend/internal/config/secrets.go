package config

import (
	"context"
	"fmt"
	"log"

	secretmanager "cloud.google.com/go/secretmanager/apiv1"
	secretmanagerpb "cloud.google.com/go/secretmanager/apiv1/secretmanagerpb"
)

// loadSecretsFromManager fetches sensitive config values from GCP Secret Manager.
// Called only when APP_ENV=production.
// Firebase Admin SDK uses Application Default Credentials automatically —
// no client ID or service account key is needed here.
func loadSecretsFromManager(ctx context.Context, cfg *Config) {
	client, err := secretmanager.NewClient(ctx)
	if err != nil {
		log.Fatalf("config: Secret Manager client: %v", err)
	}
	defer client.Close()

	cfg.JWTSecret = mustSecret(ctx, client, cfg.ProjectID, "JWT_SECRET")
}

func mustSecret(ctx context.Context, client *secretmanager.Client, projectID, name string) string {
	resource := fmt.Sprintf("projects/%s/secrets/%s/versions/latest", projectID, name)
	resp, err := client.AccessSecretVersion(ctx, &secretmanagerpb.AccessSecretVersionRequest{
		Name: resource,
	})
	if err != nil {
		log.Fatalf("config: access secret %q: %v", name, err)
	}
	return string(resp.Payload.Data)
}
