package models

import "time"

// Grade levels
const (
	GradePreK    = "pre-k"
	GradeGeneral = "general"
)

// Subjects
const (
	SubjectMath    = "mathematics"
	SubjectScience = "natural_sciences"
	SubjectSocial  = "social_sciences"
)

// Question types
const (
	TypeMultipleChoice = "multiple_choice"
	TypeShortAnswer    = "short_answer"
	TypeEssay          = "essay"
)

// Roles
const (
	RoleStudent = "student"
	RoleAdmin   = "admin"
)

// Submission statuses
const (
	StatusCompleted         = "completed"
	StatusPendingEssayGrade = "pending_essay_grade"
)

type User struct {
	GoogleID   string    `firestore:"google_id"   json:"google_id"`
	Email      string    `firestore:"email"       json:"email"`
	Name       string    `firestore:"name"        json:"name"`
	PhotoURL   string    `firestore:"photo_url"   json:"photo_url"`
	Age        int       `firestore:"age"         json:"age"`
	GradeLevel string    `firestore:"grade_level" json:"grade_level"`
	Role       string    `firestore:"role"        json:"role"`
	CreatedAt  time.Time `firestore:"created_at"  json:"created_at"`
	UpdatedAt  time.Time `firestore:"updated_at"  json:"updated_at"`
}

type Option struct {
	ID      string `firestore:"id"      json:"id"`
	Content string `firestore:"content" json:"content"`
}

type Question struct {
	ID               string    `firestore:"id"                         json:"id"`
	Order            int       `firestore:"order"                      json:"order"`
	Type             string    `firestore:"type"                       json:"type"`
	Content          string    `firestore:"content"                    json:"content"`
	Points           float64   `firestore:"points"                     json:"points"`
	Options          []Option  `firestore:"options,omitempty"          json:"options,omitempty"`
	CorrectOptionIDs []string  `firestore:"correct_option_ids,omitempty" json:"correct_option_ids,omitempty"`
	CorrectAnswers   []string  `firestore:"correct_answers,omitempty"  json:"correct_answers,omitempty"`
	Explanation      string    `firestore:"explanation,omitempty"      json:"explanation,omitempty"`
	CreatedAt        time.Time `firestore:"created_at"                 json:"created_at"`
}

// QuestionPublic strips correct-answer fields for student view.
type QuestionPublic struct {
	ID          string    `json:"id"`
	Order       int       `json:"order"`
	Type        string    `json:"type"`
	Content     string    `json:"content"`
	Points      float64   `json:"points"`
	Options     []Option  `json:"options,omitempty"`
	Explanation string    `json:"explanation,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
}

func (q Question) Public() QuestionPublic {
	return QuestionPublic{
		ID:        q.ID,
		Order:     q.Order,
		Type:      q.Type,
		Content:   q.Content,
		Points:    q.Points,
		Options:   q.Options,
		CreatedAt: q.CreatedAt,
	}
}

type Exam struct {
	ID            string    `firestore:"id"             json:"id"`
	Title         string    `firestore:"title"          json:"title"`
	Description   string    `firestore:"description"    json:"description"`
	Subject       string    `firestore:"subject"        json:"subject"`
	SubjectDetail string    `firestore:"subject_detail" json:"subject_detail"`
	GradeLevel    string    `firestore:"grade_level"    json:"grade_level"`
	TotalPoints   float64   `firestore:"total_points"   json:"total_points"`
	TimeLimitMin  int       `firestore:"time_limit_min" json:"time_limit_min"`
	IsPublished   bool      `firestore:"is_published"   json:"is_published"`
	QuestionCount int       `firestore:"question_count" json:"question_count"`
	CreatedBy     string    `firestore:"created_by"     json:"created_by"`
	CreatedAt     time.Time `firestore:"created_at"     json:"created_at"`
	UpdatedAt     time.Time `firestore:"updated_at"     json:"updated_at"`
}

// AnswerInput is the per-question payload sent by the student.
type AnswerInput struct {
	QuestionID    string   `json:"question_id"`
	AnswerText    string   `json:"answer_text,omitempty"`
	AnswerOptions []string `json:"answer_options,omitempty"`
}

type AnswerResult struct {
	QuestionID    string   `firestore:"question_id"     json:"question_id"`
	Type          string   `firestore:"type"            json:"type"`
	AnswerText    string   `firestore:"answer_text"     json:"answer_text"`
	AnswerOptions []string `firestore:"answer_options"  json:"answer_options"`
	IsCorrect     *bool    `firestore:"is_correct"      json:"is_correct"`
	PointsEarned  float64  `firestore:"points_earned"   json:"points_earned"`
}

type Submission struct {
	ID          string         `firestore:"id"           json:"id"`
	UserID      string         `firestore:"user_id"      json:"user_id"`
	ExamID      string         `firestore:"exam_id"      json:"exam_id"`
	ExamTitle   string         `firestore:"exam_title"   json:"exam_title"`
	Subject     string         `firestore:"subject"      json:"subject"`
	GradeLevel  string         `firestore:"grade_level"  json:"grade_level"`
	Score       float64        `firestore:"score"        json:"score"`
	MaxScore    float64        `firestore:"max_score"    json:"max_score"`
	Percentage  float64        `firestore:"percentage"   json:"percentage"`
	Status      string         `firestore:"status"       json:"status"`
	Answers     []AnswerResult `firestore:"answers"      json:"answers"`
	StartedAt   time.Time      `firestore:"started_at"   json:"started_at"`
	SubmittedAt time.Time      `firestore:"submitted_at" json:"submitted_at"`
	DurationSec int            `firestore:"duration_sec" json:"duration_sec"`
}

type UserStats struct {
	UserID     string    `firestore:"user_id"       json:"user_id"`
	Name       string    `firestore:"name"          json:"name"`
	PhotoURL   string    `firestore:"photo_url"     json:"photo_url"`
	GradeLevel string    `firestore:"grade_level"   json:"grade_level"`
	TotalScore float64   `firestore:"total_score"   json:"total_score"`
	ExamsTaken int       `firestore:"exams_taken"   json:"exams_taken"`
	AvgPct     float64   `firestore:"avg_percentage" json:"avg_percentage"`
	UpdatedAt  time.Time `firestore:"updated_at"    json:"updated_at"`
}
