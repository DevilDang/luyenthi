package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/luyenthi/backend/internal/auth"
	"github.com/luyenthi/backend/internal/response"
)

type contextKey string

const (
	keyUserID contextKey = "userID"
	keyRole   contextKey = "role"
	keyEmail  contextKey = "email"
)

func Auth(jwtSecret string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			header := r.Header.Get("Authorization")
			if !strings.HasPrefix(header, "Bearer ") {
				response.Error(w, http.StatusUnauthorized, "missing authorization header")
				return
			}
			claims, err := auth.VerifyToken(strings.TrimPrefix(header, "Bearer "), jwtSecret)
			if err != nil {
				response.Error(w, http.StatusUnauthorized, "invalid token")
				return
			}
			ctx := context.WithValue(r.Context(), keyUserID, claims.UserID)
			ctx = context.WithValue(ctx, keyRole, claims.Role)
			ctx = context.WithValue(ctx, keyEmail, claims.Email)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func AdminOnly(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if GetRole(r) != "admin" {
			response.Error(w, http.StatusForbidden, "admin access required")
			return
		}
		next.ServeHTTP(w, r)
	})
}

func GetUserID(r *http.Request) string {
	v, _ := r.Context().Value(keyUserID).(string)
	return v
}

func GetRole(r *http.Request) string {
	v, _ := r.Context().Value(keyRole).(string)
	return v
}
