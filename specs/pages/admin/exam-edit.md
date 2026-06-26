# Page Spec — Admin: Exam Editor

**Route:** `/admin/exams/{examID}`  
**File:** [frontend/src/pages/admin/ExamEditPage.jsx](../../../frontend/src/pages/admin/ExamEditPage.jsx)  
**Auth required:** Yes + `role == "admin"` (AdminRoute)

---

## Purpose

Edit all details of a specific exam: metadata, publish state, and the full question list (create, update, delete questions of any type). The question editor is a full-page view, not a modal.

---

## Layout — Exam Overview (question list)

```
┌─ Navbar ───────────────────────────────────────────────────┐
├────────────────────────────────────────────────────────────┤
│  ← Danh sách đề thi                                        │
│                                                             │
│  ┌── Exam Header ───────────────────────────────────────┐  │
│  │  Toán lớp 10 - Đại số Chương 1                      │  │
│  │  Toán học • Lớp 10 • 45 phút • 20 câu • 10.0đ      │  │
│  │                    [Draft → Published]  toggle       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Danh sách câu hỏi                   [+ Thêm câu hỏi]     │
│                                                             │
│  ┌── Question Row ──────────────────────────────────────┐  │
│  │  #1  [Một đáp án]   0.5đ   Mệnh đề nào sau đây...  ✏🗑│
│  │  #2  [Nhiều đáp án] 1.0đ   Chọn các mệnh đề đúng   ✏🗑│
│  │  #3  [Điền số]      1.0đ   Tính ∫₀¹ x² dx          ✏🗑│
│  │  #4  [Tự luận]      2.0đ   Chứng minh rằng...      ✏🗑│
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

---

## Layout — Question Editor (full page)

Clicking "+ Thêm câu hỏi" or ✏ on a row navigates to a dedicated full-page editor:

**Route:** `/admin/exams/{examID}/questions/new` (create) or `/admin/exams/{examID}/questions/{qID}/edit` (edit)

```
┌─ Navbar ───────────────────────────────────────────────────┐
├────────────────────────────────────────────────────────────┤
│  ← Câu hỏi / Toán lớp 10 - Đại số Chương 1               │
│                                                             │
│  ┌── Left: Editor ───────────────┐ ┌── Right: Preview ──┐ │
│  │                               │ │                    │ │
│  │  Loại câu hỏi: [Một đáp án ▾] │ │  Câu 1. (0.5đ)    │ │
│  │  Điểm:        [ 0.5          ]│ │                    │ │
│  │  Thứ tự:      [ 1            ]│ │  Mệnh đề nào       │ │
│  │                               │ │  sau đây là đúng?  │ │
│  │  Nội dung câu hỏi             │ │  ∀x ∈ ℝ: x² ≥ 0   │ │
│  │  ┌───────────────────────┐    │ │                    │ │
│  │  │ B I S | H1 H2 | …     │    │ │  ○ A. x² ≥ 0      │ │
│  │  ├───────────────────────┤    │ │  ○ B. x² > 0      │ │
│  │  │ Markdown editor       │    │ │                    │ │
│  │  │ **Mệnh đề** nào...    │    │ │                    │ │
│  │  └───────────────────────┘    │ │                    │ │
│  │                               │ │                    │ │
│  │  Đáp án (type-specific)       │ │                    │ │
│  │  ┌── Option rows ──────────┐  │ │                    │ │
│  │  │ ○ A. [text input]  [🗑] │  │ │                    │ │
│  │  │ ○ B. [text input]  [🗑] │  │ │                    │ │
│  │  │ [+ Thêm đáp án]         │  │ │                    │ │
│  │  └─────────────────────────┘  │ │                    │ │
│  │                               │ │                    │ │
│  │  Giải thích (optional)        │ │                    │ │
│  │  ┌───────────────────────┐    │ │                    │ │
│  │  │ Markdown editor       │    │ │                    │ │
│  │  └───────────────────────┘    │ │                    │ │
│  │                               │ │                    │ │
│  │  [Huỷ]          [Lưu câu hỏi] │ │                    │ │
│  └───────────────────────────────┘ └────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

Two-column layout: editor on the left, live preview on the right. On mobile, tabs switch between Edit and Preview.

---

## Exam Header

Displays current exam metadata (read-only summary):
- `title`, `description`
- `subject` + `subject_detail`, `grade_level`, `time_limit_min`
- `question_count`, `total_points`

### Publish Toggle Button

| Current State  | Button Label           | Action                                |
|----------------|------------------------|---------------------------------------|
| `false` (draft)| "Draft → Published"    | `PUT /api/admin/exams/{id}/publish`   |
| `true`         | "Published → Draft"    | `PUT /api/admin/exams/{id}/publish`   |

On success: refreshes exam data via React Query.

---

## Question List

Each row displays:
- Order number
- Type badge: `Một đáp án` / `Nhiều đáp án` / `Điền số` / `Tự luận`
- Points
- Content preview (first ~80 chars, Markdown stripped)
- Edit (✏) and Delete (🗑) action icons

Questions sorted by `order` ascending.

---

## Question Types

| Type label (UI)  | `type` value       | Answer mechanism                         |
|------------------|--------------------|------------------------------------------|
| Một đáp án       | `single_choice`    | Radio buttons; exactly 1 correct option  |
| Nhiều đáp án     | `multiple_choice`  | Checkboxes; 2+ correct options           |
| Điền số / ngắn   | `short_answer`     | Text input; matched against accepted list |
| Tự luận          | `essay`            | Textarea; manual grading only            |

---

## Question Form (full-page editor)

### Common Fields (all types)

| Field         | Type            | Required | Notes                                      |
|---------------|-----------------|----------|--------------------------------------------|
| `type`        | select          | yes      | 4-option dropdown (see table above)        |
| `order`       | number          | yes      | Display order, positive integer            |
| `content`     | Markdown editor | yes      | Rich text with math support (see below)    |
| `points`      | number          | yes      | > 0; sum of all questions ≤ 100            |
| `explanation` | Markdown editor | no       | Shown to students after submission         |

### Markdown Editor Spec

The `content` and `explanation` fields use a Markdown editor with:

- **Toolbar:** Bold, Italic, Strikethrough, H1, H2, H3, Unordered list, Ordered list, Code, Quote, Link, Image
- **Math support:** Inline `$...$` and display `$$...$$` rendered by KaTeX in the preview panel
- **Live preview:** Right-side panel (desktop) or Preview tab (mobile) updates on every keystroke
- **Stored value:** Raw Markdown string (not HTML)

### Type-specific Fields

#### Single Choice (`single_choice`)

| Field                | Type       | Notes                                                 |
|----------------------|------------|-------------------------------------------------------|
| `options`            | list       | Up to 6 rows; each has auto `id` + Markdown `content` |
| `correct_option_ids` | radio      | Exactly 1 option selected as correct                  |

Minimum 2 options. Exactly 1 correct option required.

#### Multiple Choice (`multiple_choice`)

| Field                | Type       | Notes                                                   |
|----------------------|------------|---------------------------------------------------------|
| `options`            | list       | Up to 6 rows; each has auto `id` + Markdown `content`   |
| `correct_option_ids` | checkboxes | 2 or more options marked as correct                     |

Minimum 2 options. Minimum 2 correct options required.

#### Short Answer (`short_answer`)

| Field             | Type      | Notes                                          |
|-------------------|-----------|------------------------------------------------|
| `correct_answers` | tag input | List of accepted strings (case-insensitive)    |

At least 1 accepted answer required.

#### Essay (`essay`)

No additional fields. No auto-grading. `points_earned = 0` until manual review.

---

## Save Behaviour

| Action        | API Call                                           | On Success                                |
|---------------|----------------------------------------------------|-------------------------------------------|
| Add question  | `POST /api/admin/exams/{examID}/questions`         | Navigate back to exam overview; list + header refresh |
| Edit question | `PUT /api/admin/exams/{examID}/questions/{qID}`    | Same as above                             |
| Cancel        | —                                                  | Navigate back to exam overview (no save)  |

---

## Delete Question Flow

1. Click 🗑 on a question row (from the overview page).
2. Confirm dialog: "Bạn có chắc muốn xoá câu hỏi này?"
3. `DELETE /api/admin/exams/{examID}/questions/{qID}`.
4. On success: question list and exam header refresh.

---

## Data

| API Call                                               | Trigger               |
|--------------------------------------------------------|-----------------------|
| `GET /api/admin/exams/{examID}` (with answers)         | On mount (overview)   |
| `GET /api/admin/exams/{examID}/questions/{qID}`        | On mount (edit page)  |
| `PUT /api/admin/exams/{examID}/publish`                | Publish toggle        |
| `POST /api/admin/exams/{examID}/questions`             | Save new question     |
| `PUT /api/admin/exams/{examID}/questions/{qID}`        | Save edited question  |
| `DELETE /api/admin/exams/{examID}/questions/{qID}`     | Delete confirm        |

---

## Backend Side Effects on Question Writes

After every question add / update / delete, the backend recomputes and stores on the exam doc:
- `question_count` = total number of questions in the subcollection
- `total_points` = sum of `points` across all questions

---

## UI States

| State      | Display                                                   |
|------------|-----------------------------------------------------------|
| Loading    | Full-page spinner while fetching exam / question          |
| Loaded     | Overview: header + question list                          |
| Editing    | Full-page editor with left/right split                   |
| Saving     | Save button shows "Đang lưu..." and is disabled           |
| Error      | Inline error message near the save button                 |

---

## Navigation

| Element                   | Destination                              |
|---------------------------|------------------------------------------|
| "← Danh sách đề thi"     | `/admin/exams`                           |
| "+ Thêm câu hỏi"         | `/admin/exams/{examID}/questions/new`    |
| ✏ on question row        | `/admin/exams/{examID}/questions/{qID}/edit` |
| "Huỷ" in editor           | `/admin/exams/{examID}` (overview)       |
| Save success              | `/admin/exams/{examID}` (overview)       |
