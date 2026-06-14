package main

import (
	"context"
	"log"
	"net/http"
	"strings"

	"github.com/go-chi/chi/v5"
	chimw "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/luyenthi/backend/internal/config"
	"github.com/luyenthi/backend/internal/db"
	"github.com/luyenthi/backend/internal/handlers"
	"github.com/luyenthi/backend/internal/middleware"
)

func main() {
	ctx := context.Background()
	cfg := config.Load(ctx)

	firestoreClient := db.Client(ctx, cfg.ProjectID)
	defer firestoreClient.Close()

	h := handlers.New(firestoreClient, cfg)

	r := chi.NewRouter()

	// Global middleware
	r.Use(chimw.Logger)
	r.Use(chimw.Recoverer)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   strings.Split(cfg.AllowedOrigins, ","),
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Health & warmup
	r.Get("/_ah/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("ok")) //nolint:errcheck
	})
	r.Get("/_ah/warmup", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	// ── Public routes ──────────────────────────────────────────────────────────
	r.Post("/api/auth/google", h.GoogleLogin)

	// ── Authenticated routes ───────────────────────────────────────────────────
	r.Group(func(r chi.Router) {
		r.Use(middleware.Auth(cfg.JWTSecret))

		r.Get("/api/auth/me", h.Me)

		// User profile
		r.Get("/api/users/me", h.Me)
		r.Put("/api/users/me", h.UpdateProfile)
		r.Get("/api/users/me/history", h.ExamHistory)

		// Leaderboard
		r.Get("/api/leaderboard", h.Leaderboard)

		// Exams (student)
		r.Get("/api/exams", h.ListExams)
		r.Get("/api/exams/{examID}", h.GetExam)
		r.Post("/api/exams/{examID}/submit", h.SubmitExam)

		// ── Admin-only routes ──────────────────────────────────────────────────
		r.Group(func(r chi.Router) {
			r.Use(middleware.AdminOnly)

			// Users
			r.Get("/api/admin/users", h.AdminListUsers)
			r.Put("/api/admin/users/{userID}", h.AdminUpdateUser)
			r.Delete("/api/admin/users/{userID}", h.AdminDeleteUser)

			// Exams
			r.Get("/api/admin/exams", h.AdminListExams)
			r.Post("/api/admin/exams", h.AdminCreateExam)
			r.Put("/api/admin/exams/{examID}", h.AdminUpdateExam)
			r.Delete("/api/admin/exams/{examID}", h.AdminDeleteExam)
			r.Put("/api/admin/exams/{examID}/publish", h.AdminPublishToggle)

			// Questions
			r.Post("/api/admin/exams/{examID}/questions", h.AdminAddQuestion)
			r.Put("/api/admin/exams/{examID}/questions/{questionID}", h.AdminUpdateQuestion)
			r.Delete("/api/admin/exams/{examID}/questions/{questionID}", h.AdminDeleteQuestion)
		})
	})

	log.Printf("server listening on :%s", cfg.Port)
	if err := http.ListenAndServe(":"+cfg.Port, r); err != nil {
		log.Fatal(err)
	}
}
