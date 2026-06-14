package db

import (
	"context"
	"log"
	"sync"

	"cloud.google.com/go/firestore"
)

var (
	client *firestore.Client
	once   sync.Once
)

func Client(ctx context.Context, projectID string) *firestore.Client {
	once.Do(func() {
		c, err := firestore.NewClient(ctx, projectID)
		if err != nil {
			log.Fatalf("firestore.NewClient: %v", err)
		}
		client = c
	})
	return client
}
