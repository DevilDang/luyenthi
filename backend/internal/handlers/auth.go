package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"cloud.google.com/go/firestore"
	"github.com/luyenthi/backend/internal/auth"
	"github.com/luyenthi/backend/internal/models"
	"github.com/luyenthi/backend/internal/response"
)

type firebaseLoginRequest struct {
	IDToken string `json:"id_token"`
}

type loginResponse struct {
	Token string      `json:"token"`
	User  models.User `json:"user"`
}

func (h *Handler) GoogleLogin(w http.ResponseWriter, r *http.Request) {
	var req firebaseLoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.IDToken == "" {
		response.Error(w, http.StatusBadRequest, "id_token required")
		return
	}

	ctx := r.Context()
	info, err := auth.VerifyFirebaseToken(ctx, req.IDToken)
	if err != nil {
		response.Error(w, http.StatusUnauthorized, "invalid firebase token")
		return
	}

	userRef := h.db.Collection("users").Doc(info.UID)
	snap, err := userRef.Get(ctx)

	now := time.Now()
	var user models.User

	if err != nil {
		// New user — first sign-in
		user = models.User{
			GoogleID:   info.UID,
			Email:      info.Email,
			Name:       info.Name,
			PhotoURL:   info.Picture,
			Role:       models.RoleStudent,
			GradeLevel: models.GradeGeneral,
			CreatedAt:  now,
			UpdatedAt:  now,
		}
		if _, err := userRef.Set(ctx, user); err != nil {
			response.Error(w, http.StatusInternalServerError, "failed to create user")
			return
		}
		// Seed leaderboard entry
		h.db.Collection("user_stats").Doc(info.UID).Set(ctx, models.UserStats{ //nolint:errcheck
			UserID:     info.UID,
			Name:       info.Name,
			PhotoURL:   info.Picture,
			GradeLevel: models.GradeGeneral,
			UpdatedAt:  now,
		})
	} else {
		if err := snap.DataTo(&user); err != nil {
			response.Error(w, http.StatusInternalServerError, "failed to read user")
			return
		}
		// Keep display name and photo in sync with the Firebase profile
		_, _ = userRef.Update(ctx, []firestore.Update{
			{Path: "name", Value: info.Name},
			{Path: "photo_url", Value: info.Picture},
			{Path: "updated_at", Value: now},
		})
		user.Name = info.Name
		user.PhotoURL = info.Picture
	}

	token, err := auth.CreateToken(info.UID, info.Email, user.Role, h.cfg.JWTSecret)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "failed to create token")
		return
	}

	response.OK(w, loginResponse{Token: token, User: user})
}

func (h *Handler) Me(w http.ResponseWriter, r *http.Request) {
	userID := h.userID(r)
	snap, err := h.db.Collection("users").Doc(userID).Get(r.Context())
	if err != nil {
		response.Error(w, http.StatusNotFound, "user not found")
		return
	}
	var user models.User
	if err := snap.DataTo(&user); err != nil {
		response.Error(w, http.StatusInternalServerError, "failed to read user")
		return
	}
	response.OK(w, user)
}
