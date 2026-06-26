# API Spec — Admin

Base prefix: `/api/admin`

All endpoints require:
- `Authorization: Bearer <token>`
- `role == "admin"` in the JWT claims (enforced by `AdminOnly` middleware; returns `403` otherwise)

---

## Users

### GET /api/admin/users

List all users.

**Response `200 OK`**

```json
{
  "users": [
    {
      "id": "abc123",
      "email": "user@gmail.com",
      "name": "Nguyen Van A",
      "photo_url": "https://...",
      "role": "student",
      "grade_level": "grade-10",
      "age": 16,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-06-01T00:00:00Z"
    }
  ]
}
```

Limit: 100. No filtering supported.

---

### PUT /api/admin/users/{userID}

Update any user's editable fields, including role.

**Request**

```json
{
  "name": "Nguyen Van B",
  "age": 17,
  "grade_level": "grade-11",
  "role": "admin"
}
```

| Field         | Type   | Allowed values                         |
|---------------|--------|----------------------------------------|
| `name`        | string | Any non-empty string                   |
| `age`         | int    | 0–100                                  |
| `grade_level` | string | `pre-k`, `grade-1`…`grade-12`, `general` |
| `role`        | string | `student`, `admin`                     |

**Response `200 OK`** — updated user object.

**Error Responses**

| Status | Condition                               |
|--------|-----------------------------------------|
| 400    | Invalid JSON or field value             |
| 401    | Missing/invalid JWT                     |
| 403    | Caller is not admin                     |
| 404    | User not found                          |
| 500    | Firestore write error                   |

---

### DELETE /api/admin/users/{userID}

Permanently delete a user account and associated stats.

**Response `204 No Content`**

**Error Responses**

| Status | Condition            |
|--------|----------------------|
| 401    | Missing/invalid JWT  |
| 403    | Caller is not admin  |
| 404    | User not found       |
| 500    | Firestore error      |

---

## Exams

### GET /api/admin/exams

List all exams, including unpublished drafts.

---

### GET /api/admin/exams/{examID}

Return a single exam with **full** question data (including `correct_option_ids` and `correct_answers`). Used by the admin question editor to pre-fill correct answers when editing.

**Response `200 OK`**

```json
{
  "exam": { /* Exam object */ },
  "questions": [
    {
      "id": "q_1",
      "order": 1,
      "type": "single_choice",
      "content": "...",
      "points": 0.5,
      "options": [{ "id": "opt_a", "content": "..." }],
      "correct_option_ids": ["opt_a"],
      "correct_answers": [],
      "explanation": "..."
    }
  ]
}
```

Unlike `GET /api/exams/{examID}` (public), this endpoint returns full `Question` objects including `correct_option_ids` and `correct_answers`. Works for both published and draft exams.

---

**Response `200 OK`**

```json
{
  "exams": [
    {
      "id": "exam_abc",
      "title": "Toán lớp 10 - Đại số Chương 1",
      "description": "Bài kiểm tra về tập hợp",
      "subject": "mathematics",
      "subject_detail": "Đại số",
      "grade_level": "grade-10",
      "question_count": 20,
      "total_points": 10.0,
      "time_limit_min": 45,
      "is_published": false,
      "created_by": "admin_user_id",
      "created_at": "2024-05-01T00:00:00Z",
      "updated_at": "2024-06-01T00:00:00Z"
    }
  ]
}
```

Limit: 100. Returns both `is_published=true` and `is_published=false`.

---

### POST /api/admin/exams

Create a new exam (starts as draft).

**Request**

```json
{
  "title": "Toán lớp 10 - Đại số Chương 1",
  "description": "Bài kiểm tra về tập hợp và mệnh đề",
  "subject": "mathematics",
  "subject_detail": "Đại số",
  "grade_level": "grade-10",
  "time_limit_min": 45
}
```

| Field            | Type   | Required | Notes                          |
|------------------|--------|----------|--------------------------------|
| `title`          | string | yes      |                                |
| `description`    | string | no       |                                |
| `subject`        | string | yes      | Subject enum                   |
| `subject_detail` | string | no       | Free text sub-topic            |
| `grade_level`    | string | yes      | Grade level enum               |
| `time_limit_min` | int    | yes      | Minutes; must be > 0           |

**Initial values set by backend:** `is_published=false`, `question_count=0`, `total_points=0`, `created_by=<caller user_id>`.

**Response `201 Created`** — the new exam object.

---

### PUT /api/admin/exams/{examID}

Update exam metadata (title, description, subject, subject_detail, grade_level, time_limit_min).

**Request** — any subset of the fields from POST.

**Response `200 OK`** — updated exam object.

---

### DELETE /api/admin/exams/{examID}

Delete an exam and all its questions (cascade).

**Response `204 No Content`**

---

### PUT /api/admin/exams/{examID}/publish

Toggle `is_published` between `true` and `false`.

**Request** — empty body.

**Response `200 OK`**

```json
{
  "id": "exam_abc",
  "is_published": true,
  ...
}
```

---

## Questions

### POST /api/admin/exams/{examID}/questions

Add a question to an exam.

**Request**

```json
{
  "order": 1,
  "type": "multiple_choice",
  "content": "Mệnh đề nào sau đây là đúng?",
  "points": 0.5,
  "options": [
    { "id": "opt_a", "content": "A. $x^2 \\geq 0$" },
    { "id": "opt_b", "content": "B. $x^2 > 0$" },
    { "id": "opt_c", "content": "C. $x^2 < 0$" }
  ],
  "correct_option_ids": ["opt_a"],
  "correct_answers": [],
  "explanation": "Vì bình phương của mọi số thực đều không âm."
}
```

| Field               | Type     | Required for types            | Notes                                      |
|---------------------|----------|-------------------------------|--------------------------------------------|
| `order`             | int      | all                           | Display order (1-indexed)                  |
| `type`              | string   | all                           | `multiple_choice`, `short_answer`, `essay` |
| `content`           | string   | all                           | LaTeX supported via `$...$` and `$$...$$`  |
| `points`            | float    | all                           | Must be > 0; max sum per exam ≤ 100        |
| `options`           | []Option | `multiple_choice`             | Up to 6 options, each with `id` + `content` |
| `correct_option_ids`| []string | `multiple_choice`             | IDs of correct options (1+ for multi-select) |
| `correct_answers`   | []string | `short_answer`                | List of accepted strings (case-insensitive) |
| `explanation`       | string   | no                            | Shown after submission                     |

**Response `201 Created`** — the new question object (full, including correct answers).

**Side effect:** Backend recomputes `question_count` and `total_points` on the parent exam doc.

---

### PUT /api/admin/exams/{examID}/questions/{qID}

Update an existing question. Same request shape as POST.

**Response `200 OK`** — updated question object.

**Side effect:** Backend recomputes exam `question_count` and `total_points`.

---

### DELETE /api/admin/exams/{examID}/questions/{qID}

Delete a question.

**Response `204 No Content`**

**Side effect:** Backend recomputes exam `question_count` and `total_points`.

---

## Common Admin Error Responses

| Status | Body                        | Condition                 |
|--------|-----------------------------|---------------------------|
| 401    | `{"error": "unauthorized"}` | Missing/invalid JWT       |
| 403    | `{"error": "forbidden"}`    | Role is not `admin`       |
| 404    | `{"error": "not found"}`    | Resource doesn't exist    |
| 500    | `{"error": "..."}` | Backend / Firestore error  |
