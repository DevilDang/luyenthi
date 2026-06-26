# Page Spec — Exam Taking

**Route:** `/exams/{examID}`  
**File:** [frontend/src/pages/exam/ExamPage.jsx](../../../frontend/src/pages/exam/ExamPage.jsx)  
**Auth required:** Yes (ProtectedRoute)

---

## Purpose

Full-screen exam interface. Presents questions sequentially (or via sidebar navigation), tracks a countdown timer, and submits answers.

---

## Layout

```
┌─ Sticky Header ────────────────────────────────────────────┐
│  Toán lớp 10 - Đại số Chương 1          ⏱ 44:32           │
│  Câu 5 / 20                                                 │
├─────────────────────────────────────────┬──────────────────┤
│  Question Area                          │  Question Nav    │
│                                         │  (desktop only)  │
│  Câu 5. (1.0đ)                         │  ┌─┬─┬─┬─┬─┐    │
│                                         │  │1│2│3│4│5│    │
│  Mệnh đề nào sau đây là đúng?          │  ├─┼─┼─┼─┼─┤    │
│  ∀x ∈ ℝ: x² ≥ 0                       │  │6│7│8│…│ │    │
│                                         │  └─┴─┴─┴─┴─┘    │
│  ○ A. x² ≥ 0                           │                  │
│  ○ B. x² > 0                           │  Legend:         │
│  ○ C. x² < 0                           │  ■ Đã trả lời   │
│  ○ D. x² = 0                           │  □ Chưa trả lời  │
│                                         │  ■ Câu hiện tại  │
│  [← Câu trước]    [Câu tiếp theo →]    │                  │
│                                         │                  │
│             [Nộp bài]                   │                  │
└─────────────────────────────────────────┴──────────────────┘
```

---

## Timer

Implemented via `useTimer` hook:

| Behaviour              | Detail                                                        |
|------------------------|---------------------------------------------------------------|
| Initial value          | `exam.time_limit_min * 60` seconds                           |
| Display format         | `MM:SS`                                                       |
| Warning state          | Timer text turns red when ≤ 5 minutes remaining              |
| Expiry action          | Automatically submits with whatever answers are filled in    |

The `startedAt` timestamp is captured via a `useRef` on component mount (not on first answer).

---

## Question Navigation Sidebar (desktop only)

Grid of numbered buttons, one per question:

| State               | Visual              |
|---------------------|---------------------|
| Not visited / unanswered | Light gray      |
| Answered            | Light blue          |
| Currently displayed | Solid blue          |

Clicking any cell jumps to that question.

---

## Question Types

### Multiple Choice

- Radio buttons if there is exactly one `correct_option_id`.
- Checkboxes if there are multiple `correct_option_ids` (the student sees only options, not the count of correct answers).
- Options rendered with `MathRenderer` for LaTeX support.

### Short Answer

- Single-line text `<input>`.

### Essay

- Multi-line `<textarea>`.

---

## Answer State

Stored in React state as a map: `{ [questionID]: { answer_text, answer_options } }`.

---

## Submission Flow

1. User clicks "Nộp bài".
2. If any questions are unanswered: show confirmation dialog listing the count.
3. User confirms (or timer expires) → call `POST /api/exams/{examID}/submit`:
   ```json
   {
     "started_at": "<ISO timestamp from startedAt ref>",
     "answers": [{ "question_id": "...", "answer_text": "...", "answer_options": [...] }]
   }
   ```
4. On success: navigate to `/exams/{examID}/result` passing the submission object via React Router `state`.
5. On error: show error toast; form remains interactive.

---

## Data Loading

| API Call                   | Purpose                               |
|----------------------------|---------------------------------------|
| `GET /api/exams/{examID}`  | Load exam metadata and questions      |

Questions are displayed in `order` ascending.

---

## UI States

| State      | Display                                           |
|------------|---------------------------------------------------|
| Loading    | Full-page spinner                                 |
| Error      | "Không thể tải bài thi" message with retry link  |
| Active     | Full exam interface with timer running            |
| Submitting | Inputs disabled, submit button shows spinner      |

---

## Components Used

- `QuestionCard` — renders a single question with `MathRenderer` and `AnswerInput`
- `AnswerInput` — polymorphic input (radio/checkbox/text/textarea)
- `MathRenderer` — KaTeX renderer for LaTeX in question content and options
- `useTimer` — countdown hook

---

## Math Rendering

Question `content` and option `content` fields support:
- Inline: `$...$` → rendered with KaTeX `displayMode=false`
- Display (block): `$$...$$` → rendered with KaTeX `displayMode=true`

KaTeX `throwOnError=false`: invalid LaTeX renders as red error text instead of crashing.

---

## Navigation

| Condition       | Destination                             |
|-----------------|-----------------------------------------|
| Submit success  | `/exams/{examID}/result` (with state)   |
| Back button     | `/exams` (warns if exam in progress)    |
