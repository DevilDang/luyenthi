package handlers

import (
	"context"
	"net/http"

	"cloud.google.com/go/firestore"
	"github.com/luyenthi/backend/internal/config"
	"github.com/luyenthi/backend/internal/middleware"
	"github.com/luyenthi/backend/internal/models"
	"google.golang.org/api/iterator"
)

type Handler struct {
	db  *firestore.Client
	cfg *config.Config
}

func New(db *firestore.Client, cfg *config.Config) *Handler {
	return &Handler{db: db, cfg: cfg}
}

func (h *Handler) userID(r *http.Request) string {
	return middleware.GetUserID(r)
}

// fetchQuestionsOrdered returns questions for an exam sorted by order field.
func fetchQuestionsOrdered(ctx context.Context, db *firestore.Client, examID string) ([]models.Question, error) {
	iter := db.Collection("exams").Doc(examID).Collection("questions").
		OrderBy("order", firestore.Asc).
		Documents(ctx)
	defer iter.Stop()

	var questions []models.Question
	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil, err
		}
		var q models.Question
		if err := doc.DataTo(&q); err != nil {
			continue
		}
		q.ID = doc.Ref.ID
		questions = append(questions, q)
	}
	return questions, nil
}

// collectSubmissions drains a Firestore document iterator into a Submission slice.
func collectSubmissions(iter *firestore.DocumentIterator) ([]models.Submission, error) {
	defer iter.Stop()
	var subs []models.Submission
	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil, err
		}
		var s models.Submission
		if err := doc.DataTo(&s); err != nil {
			continue
		}
		s.ID = doc.Ref.ID
		subs = append(subs, s)
	}
	return subs, nil
}

// recomputeExamMeta recomputes question_count and total_points on the exam document.
func (h *Handler) recomputeExamMeta(ctx context.Context, examID string) {
	iter := h.db.Collection("exams").Doc(examID).Collection("questions").Documents(ctx)
	defer iter.Stop()

	count := 0
	total := 0.0
	for {
		doc, err := iter.Next()
		if err != nil {
			break
		}
		var q models.Question
		if doc.DataTo(&q) == nil {
			count++
			total += q.Points
		}
	}

	h.db.Collection("exams").Doc(examID).Update(ctx, []firestore.Update{ //nolint:errcheck
		{Path: "question_count", Value: count},
		{Path: "total_points", Value: total},
	})
}
