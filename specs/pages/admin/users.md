# Page Spec — Admin: User Management

**Route:** `/admin/users`  
**File:** [frontend/src/pages/admin/UsersPage.jsx](../../../frontend/src/pages/admin/UsersPage.jsx)  
**Auth required:** Yes + `role == "admin"` (AdminRoute)

---

## Purpose

List all registered users, search by name or email, edit any user's profile and role, and delete accounts.

---

## Layout

```
┌─ Navbar ───────────────────────────────────────────────────┐
├────────────────────────────────────────────────────────────┤
│  Quản lý người dùng                                        │
│                                                             │
│  [🔍 Tìm theo tên hoặc email...]                          │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Tên         │ Email          │ Lớp   │ Vai trò │ ... │  │
│  ├─────────────┼────────────────┼───────┼─────────┼─────┤  │
│  │ Nguyen A    │ a@gmail.com    │ Lớp10 │ student │✏ 🗑 │  │
│  │ Tran B      │ b@gmail.com    │ Lớp11 │ admin   │✏ 🗑 │  │
│  │ ...                                               ... │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

---

## Search

Client-side filter over the loaded user list.  
Matches against `name` and `email` (case-insensitive substring).

---

## Table Columns

| Column    | Source field    | Notes                     |
|-----------|-----------------|---------------------------|
| Avatar    | `photo_url`     | Small circular image      |
| Tên       | `name`          |                           |
| Email     | `email`         |                           |
| Lớp       | `grade_level`   | Formatted label           |
| Vai trò   | `role`          | Badge: "admin" / "student"|
| Actions   | —               | Edit (✏) and Delete (🗑) |

---

## Edit Modal

Opens on clicking ✏ for a user.

### Fields

| Field         | Type    | Validation                |
|---------------|---------|---------------------------|
| `name`        | text    | Non-empty                 |
| `age`         | number  | 0–100                     |
| `grade_level` | select  | Grade level enum          |
| `role`        | select  | `student` / `admin`       |

### Behaviour

1. Pre-fill form with the selected user's current values.
2. On save: call `PUT /api/admin/users/{userID}`.
3. On success: React Query invalidates user list cache → table refreshes.
4. On error: show inline error message; modal stays open.

---

## Delete Flow

1. Click 🗑 on a user row.
2. Browser `confirm()` dialog: "Bạn có chắc muốn xoá người dùng này?".
3. On confirm: call `DELETE /api/admin/users/{userID}`.
4. On success: React Query invalidates user list → row disappears.
5. On error: show error toast.

---

## Data

| API Call                           | Trigger                  |
|------------------------------------|--------------------------|
| `GET /api/admin/users`             | On mount                 |
| `PUT /api/admin/users/{userID}`    | Edit modal save          |
| `DELETE /api/admin/users/{userID}` | Delete confirm           |

---

## UI States

| State    | Display                              |
|----------|--------------------------------------|
| Loading  | Spinner                              |
| Empty    | "Không có người dùng nào"            |
| Loaded   | Full table                           |
| Error    | Error message                        |

---

## Navigation

| Navbar link        | Destination        |
|--------------------|--------------------|
| Admin → Exams      | `/admin/exams`     |
