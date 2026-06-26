# Page Spec — Home / Dashboard

**Route:** `/`  
**File:** [frontend/src/pages/dashboard/HomePage.jsx](../../../frontend/src/pages/dashboard/HomePage.jsx)  
**Auth required:** Yes (ProtectedRoute)

---

## Purpose

Landing page for authenticated users. Shows a personalised welcome, a summary of recent exam performance, and a mini leaderboard.

---

## Layout

```
┌─ Navbar ───────────────────────────────────────────────────┐
├────────────────────────────────────────────────────────────┤
│  Welcome Banner                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  [avatar]  Xin chào, {name}!                        │  │
│  │            Lớp: {grade_level}                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌── Bài thi gần đây ────────┐  ┌── Bảng xếp hạng ──────┐ │
│  │  Exam 1   85%  8.5/10    │  │  1. 🥇 Nguyen Van A   │ │
│  │  Exam 2   72%  7.2/10    │  │  2. 🥈 Tran Thi B     │ │
│  │  Exam 3   60%  6.0/10    │  │  3. 🥉 Le Van C       │ │
│  │  Exam 4   90%  9.0/10    │  │  4.    Pham Thi D     │ │
│  │  Exam 5   45%  4.5/10    │  │  5.    Hoang Van E    │ │
│  └────────────────────────── ┘  └──────────────────────── ┘ │
│                                                             │
│  [Bắt đầu luyện thi →]  button                            │
└────────────────────────────────────────────────────────────┘
```

Two-column layout on desktop; stacks vertically on mobile.

---

## Data

| Section          | API Call            | Field mapping                                  |
|------------------|---------------------|------------------------------------------------|
| Welcome banner   | `AuthContext.user`  | `name`, `photo_url`, `grade_level`             |
| Recent exams     | `GET /api/users/me/history` | 5 most recent submissions (`exam_title`, `percentage`, `score`, `max_score`) |
| Mini leaderboard | `GET /api/leaderboard` | Top 5 entries (`name`, `total_score`)      |

---

## UI States

### Recent Exams Card

| State    | Display                                         |
|----------|-------------------------------------------------|
| Loading  | Skeleton rows or spinner                        |
| Empty    | "Bạn chưa làm bài thi nào" placeholder text    |
| Loaded   | List of up to 5 rows with title + score + %     |

### Mini Leaderboard Card

| State    | Display                                         |
|----------|-------------------------------------------------|
| Loading  | Skeleton rows or spinner                        |
| Loaded   | Top 5 rows; current user highlighted            |

---

## Percentage Colour Coding

| Range        | Colour  |
|--------------|---------|
| ≥ 80%        | Green   |
| 50% – 79%    | Yellow  |
| < 50%        | Red     |

---

## Navigation

| Element                    | Destination         |
|----------------------------|---------------------|
| "Bắt đầu luyện thi" button | `/exams`            |
| Leaderboard "Xem thêm"     | `/leaderboard`      |

---

## Components Used

- `Navbar`
- `LoadingSpinner`
- React Query `useQuery` for history and leaderboard
