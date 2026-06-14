package auth

import (
	"context"
	"fmt"
	"log"
	"sync"

	firebase "firebase.google.com/go/v4"
	firebaseauth "firebase.google.com/go/v4/auth"
)

var (
	fbClient *firebaseauth.Client
	fbOnce   sync.Once
)

// FirebaseTokenInfo contains the claims we care about from a verified Firebase ID token.
type FirebaseTokenInfo struct {
	UID     string
	Email   string
	Name    string
	Picture string
}

func firebaseAuthClient(ctx context.Context) *firebaseauth.Client {
	fbOnce.Do(func() {
		app, err := firebase.NewApp(ctx, nil) // uses Application Default Credentials
		if err != nil {
			log.Fatalf("firebase: init app: %v", err)
		}
		client, err := app.Auth(ctx)
		if err != nil {
			log.Fatalf("firebase: auth client: %v", err)
		}
		fbClient = client
	})
	return fbClient
}

// VerifyFirebaseToken validates a Firebase ID token and returns its claims.
func VerifyFirebaseToken(ctx context.Context, idToken string) (*FirebaseTokenInfo, error) {
	token, err := firebaseAuthClient(ctx).VerifyIDToken(ctx, idToken)
	if err != nil {
		return nil, fmt.Errorf("firebase: verify token: %w", err)
	}

	info := &FirebaseTokenInfo{UID: token.UID}
	if v, ok := token.Claims["email"].(string); ok {
		info.Email = v
	}
	if v, ok := token.Claims["name"].(string); ok {
		info.Name = v
	}
	if v, ok := token.Claims["picture"].(string); ok {
		info.Picture = v
	}
	return info, nil
}
