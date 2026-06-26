# Page Spec — Admin: Exam List

**Route:** `/admin/exams`  
**File:** [frontend/src/pages/admin/ExamsPage.jsx](../../../frontend/src/pages/admin/ExamsPage.jsx)  
**Auth required:** Yes + `role == "admin"` (AdminRoute)

---

## Purpose

List all exams (including unpublished drafts), create new exams, toggle publish status, and delete exams.

---

## Layout

```
┌─ Navbar ───────────────────────────────────────────────────┐
├────────────────────────────────────────────────────────────┤
│  Quản lý đề thi             [Import JSON]  [+ Tạo đề thi]  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Tên đề          │ Môn   │ Lớp   │ Câu │ Trạng thái  │  │
│  ├─────────────────┼───────┼───────┼─────┼─────────────┤  │
│  │ Toán lớp 10...  │ Toán  │ Lớp10 │ 20  │ [Published] │✏🗑│
│  │ Lý lớp 9...     │ KHTN  │ Lớp 9 │  0  │ [Draft]     │✏🗑│
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

---

## Table Columns

| Column      | Source field       | Notes                                  |
|-------------|--------------------|-----------------------------------------|
| Tên         | `title`            | Clickable → exam edit page             |
| Môn học     | `subject`          | Formatted label                        |
| Lớp         | `grade_level`      | Formatted label                        |
| Số câu      | `question_count`   |                                         |
| Tổng điểm   | `total_points`     | "{n}đ"                                 |
| Thời gian   | `time_limit_min`   | "{n} phút"                             |
| Trạng thái  | `is_published`     | Clickable badge (see below)            |
| Actions     | —                  | Edit link (✏) and Delete (🗑)         |

---

## Publish Toggle Badge

Clicking the status badge on any row immediately calls `PUT /api/admin/exams/{examID}/publish`.

| Current State  | Badge Display     | After click    |
|----------------|-------------------|----------------|
| `false`        | Gray "Draft"      | Becomes Published |
| `true`         | Green "Published" | Becomes Draft     |

On success: React Query invalidates exam list.

---

## Create Exam Page (full page)

Clicking "+ Tạo đề thi" navigates to a dedicated full-page form.

**Route:** `/admin/exams/new`

```
┌─ Navbar ───────────────────────────────────────────────────┐
├────────────────────────────────────────────────────────────┤
│  ← Quản lý đề thi                                          │
│                                                             │
│  Tạo đề thi mới                                            │
│                                                             │
│  Tiêu đề *                                                  │
│  [ Toán lớp 10 - Đại số Chương 1                        ]  │
│                                                             │
│  Mô tả                                                      │
│  [ Bài kiểm tra về tập hợp và mệnh đề...                ]  │
│                                                             │
│  Môn học *                  Chi tiết môn học               │
│  [ Toán học           ▾]   [ Đại số                     ]  │
│                                                             │
│  Lớp *                      Thời gian (phút) *             │
│  [ Lớp 10             ▾]   [ 45                         ]  │
│                                                             │
│                        [Huỷ]  [Tạo đề thi →]              │
└────────────────────────────────────────────────────────────┘
```

### Fields

| Field            | Type     | Required | Notes                                         |
|------------------|----------|----------|-----------------------------------------------|
| `title`          | text     | yes      |                                               |
| `description`    | textarea | no       |                                               |
| `subject`        | select   | yes      | `mathematics`, `natural_sciences`, `social_sciences` |
| `subject_detail` | text     | no       | Free-text sub-topic                           |
| `grade_level`    | select   | yes      | Grade level enum                              |
| `time_limit_min` | number   | yes      | Positive integer, minutes                     |

### Behaviour

1. On "Tạo đề thi": call `POST /api/admin/exams`.
2. On success: navigate to `/admin/exams/{newExamID}` (exam editor).
3. On error: show inline field-level error messages; form stays on page.
4. "Huỷ" navigates back to `/admin/exams` without saving.

---

## Delete Flow

1. Click 🗑 on an exam row.
2. Confirm dialog: "Bạn có chắc muốn xoá đề thi này? Tất cả câu hỏi sẽ bị xoá."
3. On confirm: call `DELETE /api/admin/exams/{examID}` (cascades to questions).
4. On success: React Query invalidates exam list → row disappears.

---

## Import Flow

1. Click "Import JSON" button → triggers a hidden `<input type="file" accept=".json">`.
2. User selects a `.json` file matching the import schema (see `specs/api/admin.md#post-apiadminexamsimport`).
3. Frontend reads the file with `FileReader`, parses JSON, then `POST /api/admin/exams/import`.
4. On success: invalidate exam list (new exam appears as Draft), show brief success message.
5. On error: show error message inline (invalid JSON format or server error).

---

## Data

| API Call                          | Trigger             |
|-----------------------------------|---------------------|
| `GET /api/admin/exams`            | On mount            |
| `POST /api/admin/exams`           | Create page save    |
| `POST /api/admin/exams/import`    | Import file select  |
| `DELETE /api/admin/exams/{id}`    | Delete confirm      |
| `PUT /api/admin/exams/{id}/publish` | Badge click      |

---

## Navigation

| Element             | Destination              |
|---------------------|--------------------------|
| "+ Tạo đề thi"      | `/admin/exams/new`       |
| Title click / ✏     | `/admin/exams/{examID}`  |
| "Huỷ" on create page| `/admin/exams`           |
| Admin → Users       | `/admin/users`           |
