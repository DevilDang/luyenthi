package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"cloud.google.com/go/firestore"
	"github.com/luyenthi/backend/internal/models"
	"github.com/luyenthi/backend/internal/response"
)

type updateProfileRequest struct {
	Name       string `json:"name"`
	Age        int    `json:"age"`
	GradeLevel string `json:"grade_level"`
}

func (h *Handler) UpdateProfile(w http.ResponseWriter, r *http.Request) {
	var req updateProfileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.Name == "" {
		response.Error(w, http.StatusBadRequest, "name is required")
		return
	}

	userID := h.userID(r)
	ctx := r.Context()
	now := time.Now()

	updates := []firestore.Update{
		{Path: "name", Value: req.Name},
		{Path: "age", Value: req.Age},
		{Path: "grade_level", Value: req.GradeLevel},
		{Path: "updated_at", Value: now},
	}
	if _, err := h.db.Collection("users").Doc(userID).Update(ctx, updates); err != nil {
		response.Error(w, http.StatusInternalServerError, "failed to update profile")
		return
	}

	// Keep user_stats name in sync
	h.db.Collection("user_stats").Doc(userID).Update(ctx, []firestore.Update{ //nolint:errcheck
		{Path: "name", Value: req.Name},
		{Path: "grade_level", Value: req.GradeLevel},
	})

	snap, _ := h.db.Collection("users").Doc(userID).Get(ctx)
	var user models.User
	snap.DataTo(&user) //nolint:errcheck
	response.OK(w, user)
}

func (h *Handler) ExamHistory(w http.ResponseWriter, r *http.Request) {
	userID := h.userID(r)
	limit := 20
	if l := r.URL.Query().Get("limit"); l != "" {
		if n, err := strconv.Atoi(l); err == nil && n > 0 && n <= 100 {
			limit = n
		}
	}

	iter := h.db.Collection("submissions").
		Where("user_id", "==", userID).
		OrderBy("submitted_at", firestore.Desc).
		Limit(limit).
		Documents(r.Context())

	subs, err := collectSubmissions(iter)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "failed to fetch history")
		return
	}
	response.OK(w, map[string]any{"submissions": subs})
}

func (h *Handler) Leaderboard(w http.ResponseWriter, r *http.Request) {
	iter := h.db.Collection("user_stats").
		OrderBy("total_score", firestore.Desc).
		Limit(50).
		Documents(r.Context())

	var entries []models.UserStats
	for {
		doc, err := iter.Next()
		if err != nil {
			break
		}
		var s models.UserStats
		if err := doc.DataTo(&s); err == nil {
			entries = append(entries, s)
		}
	}
	response.OK(w, map[string]any{"leaderboard": entries})
}
