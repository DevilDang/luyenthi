package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"cloud.google.com/go/firestore"
	"github.com/go-chi/chi/v5"
	"github.com/luyenthi/backend/internal/models"
	"github.com/luyenthi/backend/internal/response"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

// ─── Users ────────────────────────────────────────────────────────────────────

func (h *Handler) AdminListUsers(w http.ResponseWriter, r *http.Request) {
	iter := h.db.Collection("users").OrderBy("created_at", firestore.Desc).Limit(100).Documents(r.Context())
	var users []models.User
	for {
		doc, err := iter.Next()
		if err != nil {
			break
		}
		var u models.User
		if err := doc.DataTo(&u); err == nil {
			users = append(users, u)
		}
	}
	response.OK(w, map[string]any{"users": users})
}

func (h *Handler) AdminUpdateUser(w http.ResponseWriter, r *http.Request) {
	userID := chi.URLParam(r, "userID")
	var req struct {
		Name       string `json:"name"`
		Age        int    `json:"age"`
		GradeLevel string `json:"grade_level"`
		Role       string `json:"role"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}
	updates := []firestore.Update{
		{Path: "name", Value: req.Name},
		{Path: "age", Value: req.Age},
		{Path: "grade_level", Value: req.GradeLevel},
		{Path: "updated_at", Value: time.Now()},
	}
	if req.Role == models.RoleAdmin || req.Role == models.RoleStudent {
		updates = append(updates, firestore.Update{Path: "role", Value: req.Role})
	}
	if _, err := h.db.Collection("users").Doc(userID).Update(r.Context(), updates); err != nil {
		response.Error(w, http.StatusInternalServerError, "failed to update user")
		return
	}
	response.NoContent(w)
}

func (h *Handler) AdminDeleteUser(w http.ResponseWriter, r *http.Request) {
	userID := chi.URLParam(r, "userID")
	ctx := r.Context()
	h.db.Collection("users").Doc(userID).Delete(ctx)       //nolint:errcheck
	h.db.Collection("user_stats").Doc(userID).Delete(ctx)  //nolint:errcheck
	response.NoContent(w)
}

// ─── Exams ────────────────────────────────────────────────────────────────────

func (h *Handler) AdminListExams(w http.ResponseWriter, r *http.Request) {
	iter := h.db.Collection("exams").OrderBy("created_at", firestore.Desc).Limit(100).Documents(r.Context())
	var exams []models.Exam
	for {
		doc, err := iter.Next()
		if err != nil {
			break
		}
		var e models.Exam
		if err := doc.DataTo(&e); err == nil {
			e.ID = doc.Ref.ID
			exams = append(exams, e)
		}
	}
	response.OK(w, map[string]any{"exams": exams})
}

func (h *Handler) AdminCreateExam(w http.ResponseWriter, r *http.Request) {
	var req models.Exam
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.Title == "" {
		response.Error(w, http.StatusBadRequest, "title is required")
		return
	}
	if req.TotalPoints > 100 {
		response.Error(w, http.StatusBadRequest, "total_points must be <= 100")
		return
	}

	now := time.Now()
	req.CreatedBy = h.userID(r)
	req.IsPublished = false
	req.QuestionCount = 0
	req.CreatedAt = now
	req.UpdatedAt = now

	ref, _, err := h.db.Collection("exams").Add(r.Context(), req)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "failed to create exam")
		return
	}
	req.ID = ref.ID
	response.Created(w, req)
}

func (h *Handler) AdminUpdateExam(w http.ResponseWriter, r *http.Request) {
	examID := chi.URLParam(r, "examID")
	var req models.Exam
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.TotalPoints > 100 {
		response.Error(w, http.StatusBadRequest, "total_points must be <= 100")
		return
	}
	updates := []firestore.Update{
		{Path: "title", Value: req.Title},
		{Path: "description", Value: req.Description},
		{Path: "subject", Value: req.Subject},
		{Path: "subject_detail", Value: req.SubjectDetail},
		{Path: "grade_level", Value: req.GradeLevel},
		{Path: "total_points", Value: req.TotalPoints},
		{Path: "time_limit_min", Value: req.TimeLimitMin},
		{Path: "updated_at", Value: time.Now()},
	}
	if _, err := h.db.Collection("exams").Doc(examID).Update(r.Context(), updates); err != nil {
		response.Error(w, http.StatusInternalServerError, "failed to update exam")
		return
	}
	response.NoContent(w)
}

func (h *Handler) AdminDeleteExam(w http.ResponseWriter, r *http.Request) {
	examID := chi.URLParam(r, "examID")
	ctx := r.Context()
	// Delete all questions in subcollection
	iter := h.db.Collection("exams").Doc(examID).Collection("questions").Documents(ctx)
	batch := h.db.Batch()
	for {
		doc, err := iter.Next()
		if err != nil {
			break
		}
		batch.Delete(doc.Ref)
	}
	batch.Delete(h.db.Collection("exams").Doc(examID))
	batch.Commit(ctx) //nolint:errcheck
	response.NoContent(w)
}

func (h *Handler) AdminPublishToggle(w http.ResponseWriter, r *http.Request) {
	examID := chi.URLParam(r, "examID")
	ctx := r.Context()
	snap, err := h.db.Collection("exams").Doc(examID).Get(ctx)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			response.Error(w, http.StatusNotFound, "exam not found")
		} else {
			response.Error(w, http.StatusInternalServerError, "failed to fetch exam")
		}
		return
	}
	var exam models.Exam
	snap.DataTo(&exam) //nolint:errcheck

	newState := !exam.IsPublished
	h.db.Collection("exams").Doc(examID).Update(ctx, []firestore.Update{ //nolint:errcheck
		{Path: "is_published", Value: newState},
		{Path: "updated_at", Value: time.Now()},
	})
	response.OK(w, map[string]any{"is_published": newState})
}

// ─── Questions ────────────────────────────────────────────────────────────────

func (h *Handler) AdminAddQuestion(w http.ResponseWriter, r *http.Request) {
	examID := chi.URLParam(r, "examID")
	var req models.Question
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.Content == "" {
		response.Error(w, http.StatusBadRequest, "content is required")
		return
	}
	if req.Points <= 0 {
		response.Error(w, http.StatusBadRequest, "points must be positive")
		return
	}

	ctx := r.Context()
	req.CreatedAt = time.Now()

	ref, _, err := h.db.Collection("exams").Doc(examID).Collection("questions").Add(ctx, req)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "failed to add question")
		return
	}
	req.ID = ref.ID

	// Update question_count + total_points on exam
	h.recomputeExamMeta(ctx, examID)

	response.Created(w, req)
}

func (h *Handler) AdminUpdateQuestion(w http.ResponseWriter, r *http.Request) {
	examID := chi.URLParam(r, "examID")
	questionID := chi.URLParam(r, "questionID")
	var req models.Question
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}
	ctx := r.Context()
	if _, err := h.db.Collection("exams").Doc(examID).Collection("questions").Doc(questionID).Set(ctx, req); err != nil {
		response.Error(w, http.StatusInternalServerError, "failed to update question")
		return
	}
	h.recomputeExamMeta(ctx, examID)
	response.NoContent(w)
}

func (h *Handler) AdminDeleteQuestion(w http.ResponseWriter, r *http.Request) {
	examID := chi.URLParam(r, "examID")
	questionID := chi.URLParam(r, "questionID")
	ctx := r.Context()
	h.db.Collection("exams").Doc(examID).Collection("questions").Doc(questionID).Delete(ctx) //nolint:errcheck
	h.recomputeExamMeta(ctx, examID)
	response.NoContent(w)
}

