package grading

import (
	"sort"
	"strings"

	"github.com/luyenthi/backend/internal/models"
)

type Result struct {
	Answers    []models.AnswerResult
	Score      float64
	MaxScore   float64
	Percentage float64
	Status     string
}

func Grade(questions []models.Question, inputs []models.AnswerInput) Result {
	qMap := make(map[string]models.Question, len(questions))
	maxScore := 0.0
	for _, q := range questions {
		qMap[q.ID] = q
		maxScore += q.Points
	}

	results := make([]models.AnswerResult, 0, len(inputs))
	score := 0.0
	hasEssay := false

	for _, input := range inputs {
		q, ok := qMap[input.QuestionID]
		if !ok {
			continue
		}

		ar := models.AnswerResult{
			QuestionID:    input.QuestionID,
			Type:          q.Type,
			AnswerText:    input.AnswerText,
			AnswerOptions: input.AnswerOptions,
		}

		switch q.Type {
		case models.TypeSingleChoice, models.TypeMultipleChoice:
			correct := checkOptions(input.AnswerOptions, q.CorrectOptionIDs)
			ar.IsCorrect = &correct
			if correct {
				ar.PointsEarned = q.Points
				score += q.Points
			}
		case models.TypeShortAnswer:
			correct := checkText(input.AnswerText, q.CorrectAnswers)
			ar.IsCorrect = &correct
			if correct {
				ar.PointsEarned = q.Points
				score += q.Points
			}
		case models.TypeEssay:
			hasEssay = true
			// no auto-grade
		}

		results = append(results, ar)
	}

	status := models.StatusCompleted
	if hasEssay {
		status = models.StatusPendingEssayGrade
	}

	pct := 0.0
	if maxScore > 0 {
		pct = (score / maxScore) * 100
	}

	return Result{
		Answers:    results,
		Score:      score,
		MaxScore:   maxScore,
		Percentage: pct,
		Status:     status,
	}
}

func checkOptions(selected, correct []string) bool {
	if len(selected) != len(correct) {
		return false
	}
	a := append([]string(nil), selected...)
	b := append([]string(nil), correct...)
	sort.Strings(a)
	sort.Strings(b)
	for i := range a {
		if a[i] != b[i] {
			return false
		}
	}
	return true
}

func checkText(answer string, accepted []string) bool {
	norm := normalize(answer)
	for _, a := range accepted {
		if norm == normalize(a) {
			return true
		}
	}
	return false
}

func normalize(s string) string {
	return strings.ToLower(strings.TrimSpace(s))
}
