package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"cloud.google.com/go/firestore"
	"github.com/go-chi/chi/v5"
	"github.com/luyenthi/backend/internal/grading"
	"github.com/luyenthi/backend/internal/models"
	"github.com/luyenthi/backend/internal/response"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func (h *Handler) ListExams(w http.ResponseWriter, r *http.Request) {
	q := h.db.Collection("exams").Where("is_published", "==", true)

	if grade := r.URL.Query().Get("grade"); grade != "" {
		q = q.Where("grade_level", "==", grade)
	}
	if subj := r.URL.Query().Get("subject"); subj != "" {
		q = q.Where("subject", "==", subj)
	}

	limit := 20
	if l := r.URL.Query().Get("limit"); l != "" {
		if n, err := strconv.Atoi(l); err == nil && n > 0 && n <= 100 {
			limit = n
		}
	}

	iter := q.OrderBy("created_at", firestore.Desc).Limit(limit).Documents(r.Context())
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

func (h *Handler) GetExam(w http.ResponseWriter, r *http.Request) {
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
	if err := snap.DataTo(&exam); err != nil {
		response.Error(w, http.StatusInternalServerError, "failed to read exam")
		return
	}
	exam.ID = snap.Ref.ID

	if !exam.IsPublished {
		response.Error(w, http.StatusNotFound, "exam not found")
		return
	}

	questions, err := fetchQuestionsOrdered(ctx, h.db, examID)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "failed to fetch questions")
		return
	}

	// Strip correct answers for student view
	pub := make([]models.QuestionPublic, len(questions))
	for i, q := range questions {
		pub[i] = q.Public()
	}

	response.OK(w, map[string]any{"exam": exam, "questions": pub})
}

type submitRequest struct {
	StartedAt time.Time            `json:"started_at"`
	Answers   []models.AnswerInput `json:"answers"`
}

func (h *Handler) SubmitExam(w http.ResponseWriter, r *http.Request) {
	examID := chi.URLParam(r, "examID")
	userID := h.userID(r)
	ctx := r.Context()

	var req submitRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	// Fetch exam
	examSnap, err := h.db.Collection("exams").Doc(examID).Get(ctx)
	if err != nil {
		response.Error(w, http.StatusNotFound, "exam not found")
		return
	}
	var exam models.Exam
	examSnap.DataTo(&exam) //nolint:errcheck
	exam.ID = examSnap.Ref.ID

	if !exam.IsPublished {
		response.Error(w, http.StatusNotFound, "exam not found")
		return
	}

	questions, err := fetchQuestionsOrdered(ctx, h.db, examID)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "failed to fetch questions")
		return
	}

	result := grading.Grade(questions, req.Answers)

	now := time.Now()
	durSec := 0
	if !req.StartedAt.IsZero() {
		durSec = int(now.Sub(req.StartedAt).Seconds())
	}

	sub := models.Submission{
		UserID:      userID,
		ExamID:      examID,
		ExamTitle:   exam.Title,
		Subject:     exam.Subject,
		GradeLevel:  exam.GradeLevel,
		Score:       result.Score,
		MaxScore:    result.MaxScore,
		Percentage:  result.Percentage,
		Status:      result.Status,
		Answers:     result.Answers,
		StartedAt:   req.StartedAt,
		SubmittedAt: now,
		DurationSec: durSec,
	}

	// Atomic batch: write submission + update user_stats
	batch := h.db.Batch()

	subRef := h.db.Collection("submissions").NewDoc()
	sub.ID = subRef.ID
	batch.Set(subRef, sub)

	statsRef := h.db.Collection("user_stats").Doc(userID)
	statsSnap, err := statsRef.Get(ctx)
	if err == nil {
		var stats models.UserStats
		statsSnap.DataTo(&stats) //nolint:errcheck
		newTotal := stats.TotalScore + result.Score
		newCount := stats.ExamsTaken + 1
		newAvg := newTotal / float64(newCount)
		batch.Update(statsRef, []firestore.Update{
			{Path: "total_score", Value: newTotal},
			{Path: "exams_taken", Value: newCount},
			{Path: "avg_percentage", Value: newAvg},
			{Path: "updated_at", Value: now},
		})
	}

	if _, err := batch.Commit(ctx); err != nil {
		response.Error(w, http.StatusInternalServerError, "failed to save submission")
		return
	}

	response.Created(w, sub)
}
