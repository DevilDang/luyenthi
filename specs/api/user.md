# API Spec — User

Base prefix: `/api/users/me`

All endpoints require `Authorization: Bearer <token>`.

---

## GET /api/users/me

Return the current user's profile. (Same as `GET /api/auth/me` — both resolve the same user doc.)

### Success Response `200 OK`

```json
{
  "id": "abc123",
  "email": "user@gmail.com",
  "name": "Nguyen Van A",
  "photo_url": "https://lh3.googleusercontent.com/...",
  "role": "student",
  "grade_level": "grade-10",
  "age": 16,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-06-01T00:00:00Z"
}
```

---

## PUT /api/users/me

Update the current user's editable profile fields.

### Request

```json
{
  "name": "Nguyen Van B",
  "age": 17,
  "grade_level": "grade-11"
}
```

| Field         | Type   | Required | Validation                  |
|---------------|--------|----------|-----------------------------|
| `name`        | string | no       | Non-empty if provided       |
| `age`         | int    | no       | 0–100                       |
| `grade_level` | string | no       | See grade level enum below  |

**Grade level enum**
`pre-k`, `grade-1` … `grade-12`, `general`

### Success Response `200 OK`

Returns the full updated user object (same shape as GET /api/users/me).

### Side Effects

- Updates `user_stats.name` and `user_stats.grade_level` so the leaderboard stays in sync.

### Error Responses

| Status | Body                              | Condition            |
|--------|-----------------------------------|----------------------|
| 400    | `{"error": "..."}` | Invalid JSON or field value |
| 401    | `{"error": "unauthorized"}`       | Missing/invalid JWT  |
| 500    | `{"error": "..."}` | Firestore write error |

---

## GET /api/users/me/history

Return the current user's exam submission history.

### Query Parameters

None. Returns the 20 most recent submissions, sorted by `submitted_at` descending.

### Success Response `200 OK`

```json
{
  "submissions": [
    {
      "id": "sub_xyz",
      "exam_id": "exam_abc",
      "exam_title": "Toán lớp 10 - Chương 1",
      "subject": "mathematics",
      "grade_level": "grade-10",
      "score": 8.5,
      "max_score": 10.0,
      "percentage": 85.0,
      "status": "completed",
      "started_at": "2024-06-01T09:00:00Z",
      "submitted_at": "2024-06-01T09:45:00Z",
      "duration_sec": 2700
    }
  ]
}
```

**Submission status values**

| Value                  | Meaning                                   |
|------------------------|-------------------------------------------|
| `completed`            | Fully auto-graded                         |
| `pending_essay_grade`  | Contains essay questions; admin must grade |

### Error Responses

| Status | Body                        | Condition           |
|--------|-----------------------------|---------------------|
| 401    | `{"error": "unauthorized"}` | Missing/invalid JWT |
| 500    | `{"error": "..."}` | Firestore read error |

---

## GET /api/leaderboard

Return the top 50 students ranked by total score.

**Auth required:** Yes

### Success Response `200 OK`

```json
{
  "leaderboard": [
    {
      "user_id": "abc123",
      "name": "Nguyen Van A",
      "photo_url": "https://lh3.googleusercontent.com/...",
      "grade_level": "grade-10",
      "total_score": 95.5,
      "exams_taken": 12,
      "avg_percentage": 87.3
    }
  ]
}
```

Sorted by `total_score` descending. Limit: 50.

### Error Responses

| Status | Body                        | Condition           |
|--------|-----------------------------|---------------------|
| 401    | `{"error": "unauthorized"}` | Missing/invalid JWT |
| 500    | `{"error": "..."}` | Firestore read error |
