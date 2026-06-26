# Page Spec — Profile

**Route:** `/profile`  
**File:** [frontend/src/pages/profile/ProfilePage.jsx](../../../frontend/src/pages/profile/ProfilePage.jsx)  
**Auth required:** Yes (ProtectedRoute)

---

## Purpose

View and edit the current user's personal information. Display aggregate exam statistics.

---

## Layout

```
┌─ Navbar ───────────────────────────────────────────────────┐
├────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐  │
│  │  [avatar]   Nguyen Van A                            │  │
│  │             user@gmail.com  (read-only)              │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌── Stats ─────────────────────────────────────────────┐  │
│  │  Bài đã làm: 12          Trung bình: 78%            │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌── Edit Profile ──────────────────────────────────────┐  │
│  │  Tên:        [ Nguyen Van A          ]               │  │
│  │  Tuổi:       [ 16                   ]               │  │
│  │  Lớp:        [ Lớp 10              ▾]               │  │
│  │                                                      │  │
│  │              [  Lưu thay đổi  ]                     │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

---

## Read-only Fields

| Field       | Source              |
|-------------|---------------------|
| Avatar      | `user.photo_url`    |
| Name        | `user.name`         |
| Email       | `user.email`        |

Email is always read-only (controlled by Google account).

---

## Stats Section

Derived from `GET /api/users/me/history`:

| Stat            | Calculation                                      |
|-----------------|--------------------------------------------------|
| Bài đã làm      | `submissions.length`                             |
| Trung bình      | Average of `percentage` across all submissions   |

---

## Edit Form Fields

| Field         | Type     | Validation              | Bound to         |
|---------------|----------|-------------------------|------------------|
| `name`        | text     | Non-empty               | `user.name`      |
| `age`         | number   | 0–100, integer          | `user.age`       |
| `grade_level` | select   | One of grade level enum | `user.grade_level` |

### Grade Level Options (same as exam filter)
`pre-k`, `grade-1`…`grade-12`, `general`

---

## Save Behaviour

1. On "Lưu thay đổi" click: call `PUT /api/users/me` with changed fields.
2. On success: update `AuthContext.user` with returned user data.
3. Show success toast / confirmation.
4. On error: show error message inline.

---

## UI States

| State      | Display                                              |
|------------|------------------------------------------------------|
| Loading    | Spinner while fetching history for stats             |
| Idle       | Form pre-filled with current values                  |
| Saving     | Submit button shows "Đang lưu..." and is disabled    |
| Saved      | Success message, form re-enabled                     |
| Error      | Error message near form, form re-enabled             |

---

## Data

| API Call                     | Purpose                     |
|------------------------------|-----------------------------|
| `AuthContext.user`           | Pre-fill form               |
| `GET /api/users/me/history`  | Compute stats               |
| `PUT /api/users/me`          | Save edits                  |
