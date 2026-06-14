package config

import (
	"context"
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	AppEnv         string
	JWTSecret      string
	ProjectID      string
	AllowedOrigins string
	Port           string
}

// Load reads config from environment variables.
// In development it first loads a .env file if present.
// In production it fetches secrets from Secret Manager.
func Load(ctx context.Context) *Config {
	appEnv := getEnv("APP_ENV", "development")

	if appEnv != "production" {
		if err := godotenv.Load(); err != nil {
			log.Println("config: no .env file found, using shell environment")
		}
		appEnv = getEnv("APP_ENV", "development")
	}

	cfg := &Config{
		AppEnv:         appEnv,
		ProjectID:      getEnv("GOOGLE_CLOUD_PROJECT", ""),
		JWTSecret:      getEnv("JWT_SECRET", ""),
		AllowedOrigins: getEnv("ALLOWED_ORIGINS", "http://localhost:5173"),
		Port:           getEnv("PORT", "8080"),
	}

	if appEnv == "production" {
		if cfg.ProjectID == "" {
			log.Fatal("config: GOOGLE_CLOUD_PROJECT is required in production")
		}
		loadSecretsFromManager(ctx, cfg)
	} else {
		if cfg.JWTSecret == "" {
			log.Fatal("config: JWT_SECRET is required — set it in .env or the shell")
		}
	}

	return cfg
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
