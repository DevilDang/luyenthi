# Page Spec — Exam Result

**Route:** `/exams/{examID}/result`  
**File:** [frontend/src/pages/exam/ResultPage.jsx](../../../frontend/src/pages/exam/ResultPage.jsx)  
**Auth required:** Yes (ProtectedRoute)

---

## Purpose

Display the submission result after completing an exam: overall score, per-question breakdown with correct/incorrect indicators, and (if applicable) a note that essay questions are pending manual review.

---

## Data Source

The submission object is passed via React Router `location.state` from the exam-taking page. If the user navigates directly to this URL without state, redirect to `/exams`.

---

## Layout

```
┌─ Navbar ───────────────────────────────────────────────────┐
├────────────────────────────────────────────────────────────┤
│  Kết quả bài thi                                           │
│  Toán lớp 10 - Đại số Chương 1                            │
│                                                             │
│  ┌── Score Summary ─────────────────────────────────────┐  │
│  │                                                      │  │
│  │           8.5 / 10.0                                │  │
│  │              85%           ← green (≥80%)           │  │
│  │                                                      │  │
│  │  [ℹ️  Có câu tự luận chờ chấm điểm]   (if essay)    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌── Question Review ───────────────────────────────────┐  │
│  │  Câu 1  ✓  0.5đ / 0.5đ    (green)                  │  │
│  │  Câu 2  ✗  0.0đ / 1.0đ    (red)                    │  │
│  │  Câu 3  ✎  Chờ chấm       (yellow)                  │  │
│  │  ...                                                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  [← Về danh sách đề thi]   [Về trang chủ]                │
└────────────────────────────────────────────────────────────┘
```

---

## Score Summary

| Field          | Source                    | Display                          |
|----------------|---------------------------|----------------------------------|
| Raw score      | `submission.score`        | "{score} / {max_score}"         |
| Percentage     | `submission.percentage`   | "{n}%", colour-coded             |
| Status notice  | `submission.status`       | Shown only if `pending_essay_grade` |

### Percentage Colour Coding

| Range      | Colour  | Meaning        |
|------------|---------|----------------|
| ≥ 80%      | Green   | Đạt tốt        |
| 50%–79%    | Yellow  | Trung bình     |
| < 50%      | Red     | Cần cố gắng    |

---

## Question Review List

Each row maps to one entry in `submission.answers`:

| `is_correct` | `type`            | Row Colour | Points display              |
|--------------|-------------------|------------|-----------------------------|
| `true`       | any               | Green      | "✓ {points_earned}đ / {question.points}đ" |
| `false`      | any               | Red        | "✗ {points_earned}đ / {question.points}đ" |
| `null`       | `essay`           | Yellow     | "✎ Chờ chấm điểm thủ công"  |

Question content and options are rendered via `MathRenderer` (same as exam-taking page).

If the question has an `explanation` field (non-empty), it is shown below the answer row (for correct/incorrect questions).

---

## Pending Essay Notice

When `submission.status == "pending_essay_grade"`:

- Display a banner below the score summary explaining that essay questions have not been automatically graded and the total score may change after manual review.

---

## Navigation

| Element                     | Destination |
|-----------------------------|-------------|
| "Về danh sách đề thi"       | `/exams`    |
| "Về trang chủ"              | `/`         |

---

## Components Used

- `QuestionCard` (review mode — `AnswerInput` disabled, result shown)
- `MathRenderer`
