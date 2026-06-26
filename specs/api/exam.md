# API Spec — Exams (Student)

Base prefix: `/api/exams`

All endpoints require `Authorization: Bearer <token>`.

---

## GET /api/exams

List published exams with optional filters.

### Query Parameters

| Param          | Type   | Description                     |
|----------------|--------|---------------------------------|
| `grade_level`  | string | Filter by grade level enum      |
| `subject`      | string | Filter by subject enum          |

**Subject enum:** `mathematics`, `natural_sciences`, `social_sciences`

**Grade level enum:** `pre-k`, `grade-1` … `grade-12`, `general`

### Success Response `200 OK`

```json
{
  "exams": [
    {
      "id": "exam_abc",
      "title": "Toán lớp 10 - Đại số Chương 1",
      "description": "Bài kiểm tra về tập hợp và mệnh đề",
      "subject": "mathematics",
      "subject_detail": "Đại số",
      "grade_level": "grade-10",
      "question_count": 20,
      "total_points": 10.0,
      "time_limit_min": 45,
      "is_published": true,
      "created_at": "2024-05-01T00:00:00Z"
    }
  ]
}
```

Only `is_published=true` exams are returned. Limit: 20.

### Error Responses

| Status | Body                        | Condition           |
|--------|-----------------------------|---------------------|
| 401    | `{"error": "unauthorized"}` | Missing/invalid JWT |
| 500    | `{"error": "..."}` | Firestore query error |

---

## GET /api/exams/{examID}

Get a single published exam with its questions. Correct answers are **stripped** from the response.

### Path Parameters

| Param    | Type   | Description        |
|----------|--------|--------------------|
| `examID` | string | Exam document ID   |

### Success Response `200 OK`

```json
{
  "id": "exam_abc",
  "title": "Toán lớp 10 - Đại số Chương 1",
  "description": "Bài kiểm tra về tập hợp và mệnh đề",
  "subject": "mathematics",
  "subject_detail": "Đại số",
  "grade_level": "grade-10",
  "question_count": 20,
  "total_points": 10.0,
  "time_limit_min": 45,
  "is_published": true,
  "questions": [
    {
      "id": "q_1",
      "order": 1,
      "type": "multiple_choice",
      "content": "Mệnh đề nào sau đây là đúng? $\\forall x \\in \\mathbb{R}$",
      "points": 0.5,
      "options": [
        { "id": "opt_a", "content": "A. $x^2 \\geq 0$" },
        { "id": "opt_b", "content": "B. $x^2 > 0$" }
      ]
    },
    {
      "id": "q_2",
      "order": 2,
      "type": "short_answer",
      "content": "Tính $\\int_0^1 x^2\\,dx$",
      "points": 1.0,
      "options": []
    },
    {
      "id": "q_3",
      "order": 3,
      "type": "essay",
      "content": "Chứng minh rằng $\\sqrt{2}$ là số vô tỉ.",
      "points": 2.0,
      "options": []
    }
  ]
}
```

**Fields deliberately absent from questions (student view):**
- `correct_option_ids` — correct answer IDs for multiple choice
- `correct_answers` — accepted strings for short answer

### Error Responses

| Status | Body                           | Condition                     |
|--------|--------------------------------|-------------------------------|
| 401    | `{"error": "unauthorized"}`    | Missing/invalid JWT           |
| 404    | `{"error": "exam not found"}`  | Exam doesn't exist or is unpublished |
| 500    | `{"error": "..."}` | Firestore read error          |

---

## POST /api/exams/{examID}/submit

Submit answers for a completed exam. The backend auto-grades multiple-choice and short-answer questions.

### Path Parameters

| Param    | Type   | Description        |
|----------|--------|--------------------|
| `examID` | string | Exam document ID   |

### Request

```json
{
  "started_at": "2024-06-01T09:00:00Z",
  "answers": [
    {
      "question_id": "q_1",
      "answer_options": ["opt_a"]
    },
    {
      "question_id": "q_2",
      "answer_text": "1/3"
    },
    {
      "question_id": "q_3",
      "answer_text": "Giả sử sqrt(2) là số hữu tỉ..."
    }
  ]
}
```

| Field              | Type     | Required | Description                                  |
|--------------------|----------|----------|----------------------------------------------|
| `started_at`       | ISO 8601 | yes      | When the user began the exam (client time)   |
| `answers`          | array    | yes      | One entry per answered question              |
| `answers[].question_id` | string | yes | Must match a question ID in the exam       |
| `answers[].answer_options` | string[] | no | For `multiple_choice` questions         |
| `answers[].answer_text`    | string   | no | For `short_answer` and `essay` questions |

### Success Response `200 OK`

```json
{
  "id": "sub_xyz",
  "exam_id": "exam_abc",
  "exam_title": "Toán lớp 10 - Đại số Chương 1",
  "subject": "mathematics",
  "grade_level": "grade-10",
  "score": 7.5,
  "max_score": 10.0,
  "percentage": 75.0,
  "status": "completed",
  "answers": [
    {
      "question_id": "q_1",
      "type": "multiple_choice",
      "answer_options": ["opt_a"],
      "is_correct": true,
      "points_earned": 0.5
    },
    {
      "question_id": "q_2",
      "type": "short_answer",
      "answer_text": "1/3",
      "is_correct": false,
      "points_earned": 0.0
    },
    {
      "question_id": "q_3",
      "type": "essay",
      "answer_text": "Giả sử sqrt(2) là số hữu tỉ...",
      "is_correct": null,
      "points_earned": 0.0
    }
  ],
  "started_at": "2024-06-01T09:00:00Z",
  "submitted_at": "2024-06-01T09:44:00Z",
  "duration_sec": 2640
}
```

**`is_correct` values**

| Value  | Meaning                                 |
|--------|-----------------------------------------|
| `true` | Auto-graded correct                     |
| `false`| Auto-graded incorrect                   |
| `null` | Essay — not auto-graded                 |

**`status` values**

| Value                 | Meaning                                    |
|-----------------------|--------------------------------------------|
| `completed`           | All questions auto-graded                  |
| `pending_essay_grade` | One or more essay questions present        |

### Grading Rules

| Question Type    | Grading Method                                                    |
|------------------|-------------------------------------------------------------------|
| `multiple_choice`| Compare submitted `answer_options` (sorted) with `correct_option_ids` (sorted). Full points if exact match. |
| `short_answer`   | Normalize answer (lowercase, trim). Check against `correct_answers` list. Full points if any match. |
| `essay`          | No auto-grading. `points_earned = 0`, `is_correct = null`. Sets status to `pending_essay_grade`. |

### Atomic Side Effects

On successful submission, a Firestore batch atomically:
1. Writes the submission document to `submissions/{submissionID}`.
2. Updates `user_stats/{userID}`: increments `exams_taken`, adds to `total_score`, recomputes `avg_percentage`.

### Error Responses

| Status | Body                              | Condition                              |
|--------|-----------------------------------|----------------------------------------|
| 400    | `{"error": "..."}` | Invalid JSON, missing `started_at`     |
| 401    | `{"error": "unauthorized"}`       | Missing/invalid JWT                    |
| 404    | `{"error": "exam not found"}`     | Exam doesn't exist or is unpublished   |
| 500    | `{"error": "..."}` | Grading or Firestore write error       |
