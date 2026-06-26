# Page Spec — Leaderboard

**Route:** `/leaderboard`  
**File:** [frontend/src/pages/dashboard/LeaderboardPage.jsx](../../../frontend/src/pages/dashboard/LeaderboardPage.jsx)  
**Auth required:** Yes (ProtectedRoute)

---

## Purpose

Display the top 50 students ranked by cumulative total score across all submitted exams.

---

## Layout

```
┌─ Navbar ───────────────────────────────────────────────────┐
├────────────────────────────────────────────────────────────┤
│  Bảng xếp hạng                                             │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Hạng │ Học sinh          │ Lớp     │ Điểm │ Bài │ %  │  │
│  ├──────┼───────────────────┼─────────┼──────┼─────┼────┤  │
│  │  🥇  │ [avatar] Name     │ Lớp 10  │ 95.5 │ 12  │87% │  │
│  │  🥈  │ [avatar] Name     │ Lớp 11  │ 88.0 │ 10  │82% │  │
│  │  🥉  │ [avatar] Name     │ Lớp 12  │ 80.5 │  9  │79% │  │
│  │   4  │ [avatar] Name*    │ Lớp 9   │ 75.0 │  8  │71% │  │
│  │  ... │ ...               │ ...     │ ...  │ ... │... │  │
│  └──────────────────────────────────────────────────────┘  │
│  * current user row highlighted                             │
└────────────────────────────────────────────────────────────┘
```

---

## Table Columns

| Column        | Source field         | Notes                                      |
|---------------|----------------------|--------------------------------------------|
| Rank          | Row index (1-based)  | 🥇🥈🥉 icons for top 3; numbers for rest   |
| Avatar        | `photo_url`          | Small circular avatar image                |
| Name          | `name`               | Current user row has distinct highlight    |
| Grade         | `grade_level`        | Formatted label (e.g. "Lớp 10")           |
| Total score   | `total_score`        | Cumulative sum across all submissions      |
| Exams taken   | `exams_taken`        | Count of submissions                       |
| Avg %         | `avg_percentage`     | Displayed as "XX.X%"                       |

---

## Data

| API Call             | Notes                                     |
|----------------------|-------------------------------------------|
| `GET /api/leaderboard` | Returns up to 50 users, sorted by `total_score` desc |

Current user identification: compare `leaderboard[i].user_id` with `AuthContext.user.id`.

---

## UI States

| State    | Display                                       |
|----------|-----------------------------------------------|
| Loading  | Full-width spinner                            |
| Empty    | "Chưa có dữ liệu xếp hạng"                  |
| Loaded   | Full table                                    |
| Error    | Error message                                 |

---

## Current User Highlight

The row belonging to the authenticated user is visually distinguished (e.g., different background colour or bold text) to help users quickly locate their own rank.

---

## Navigation

No outbound navigation from this page. Navbar provides return to other sections.
