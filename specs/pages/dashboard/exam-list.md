# Page Spec — Exam List

**Route:** `/exams`  
**File:** [frontend/src/pages/dashboard/ExamListPage.jsx](../../../frontend/src/pages/dashboard/ExamListPage.jsx)  
**Auth required:** Yes (ProtectedRoute)

---

## Purpose

Browse and filter published exams by grade level and subject. Select an exam to begin taking it.

---

## Layout

```
┌─ Navbar ───────────────────────────────────────────────────┐
├────────────────────────────────────────────────────────────┤
│  Danh sách bài thi                                          │
│                                                             │
│  [Grade Level ▾]   [Subject ▾]                             │
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │ Toán lớp 10      │  │ Khoa học TN lớp 9│               │
│  │ Đại số           │  │ Vật lý           │               │
│  │ 20 câu  |  10đ   │  │ 15 câu  |  10đ   │               │
│  │ ⏱ 45 phút        │  │ ⏱ 30 phút        │               │
│  │ [Làm bài →]      │  │ [Làm bài →]      │               │
│  └──────────────────┘  └──────────────────┘               │
│  ...                                                        │
└────────────────────────────────────────────────────────────┘
```

Grid layout: 2 columns on tablet, 3 on desktop, 1 on mobile.

---

## Filter Controls

### Grade Level Dropdown

14 options:

| Value      | Display label     |
|------------|-------------------|
| `general`  | Tất cả lớp        |
| `pre-k`    | Mầm non           |
| `grade-1`  | Lớp 1             |
| …          | …                 |
| `grade-12` | Lớp 12            |

Default: `general` (no filter applied — returns all).

### Subject Dropdown

| Value              | Display label   |
|--------------------|-----------------|
| (empty)            | Tất cả môn      |
| `mathematics`      | Toán học        |
| `natural_sciences` | Khoa học TN     |
| `social_sciences`  | Khoa học XH     |

Default: (empty) — no subject filter.

---

## Exam Card Fields

| Field             | Source                  | Display               |
|-------------------|-------------------------|-----------------------|
| Title             | `exam.title`            | Card heading          |
| Subject detail    | `exam.subject_detail`   | Sub-heading / tag     |
| Question count    | `exam.question_count`   | "{n} câu hỏi"        |
| Total points      | `exam.total_points`     | "{n}đ"               |
| Time limit        | `exam.time_limit_min`   | "⏱ {n} phút"         |
| Grade level       | `exam.grade_level`      | Badge / meta          |

---

## Data

| API Call          | Trigger                                 |
|-------------------|-----------------------------------------|
| `GET /api/exams`  | On mount and when filters change        |

Query params sent: `grade_level` (omitted if `general` or empty), `subject` (omitted if empty).

---

## UI States

| State    | Display                                       |
|----------|-----------------------------------------------|
| Loading  | Spinner or skeleton cards                     |
| Empty    | "Không có bài thi nào phù hợp" message        |
| Loaded   | Grid of exam cards                            |
| Error    | Error message with retry option               |

---

## Navigation

| Element              | Destination             |
|----------------------|-------------------------|
| "Làm bài" on a card  | `/exams/{examID}`       |
