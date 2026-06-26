# LuyenThi — Design Specs Index

Exam preparation platform with Google OAuth, timed exams, auto-grading, and leaderboards.

## Structure

```
specs/
├── api/
│   ├── auth.md          Auth endpoints (Google login, JWT, /me)
│   ├── user.md          User profile and history endpoints
│   ├── exam.md          Public exam endpoints (list, get, submit)
│   └── admin.md         Admin-only endpoints (users, exams, questions)
└── pages/
    ├── auth/
    │   └── login.md     Login page
    ├── dashboard/
    │   ├── home.md      Dashboard / home page
    │   ├── exam-list.md Exam browsing page
    │   └── leaderboard.md Leaderboard page
    ├── profile/
    │   └── profile.md   User profile page
    ├── exam/
    │   ├── exam-taking.md Timed exam interface
    │   └── result.md    Result / review page
    └── admin/
        ├── users.md     Admin user management
        ├── exams.md     Admin exam list management
        └── exam-edit.md Admin exam + question editor
```

## Tech Stack

| Layer     | Technology                                  |
|-----------|---------------------------------------------|
| Frontend  | React 18, Vite, React Router v6, Tailwind   |
| State     | React Context + TanStack React Query         |
| Auth      | Firebase Authentication (Google OAuth)       |
| Math      | KaTeX 0.16.10                               |
| Backend   | Go 1.22+, chi router                        |
| Database  | Cloud Firestore                              |
| Deploy    | Google App Engine                            |
| Secrets   | GCP Secret Manager                          |

## Role Model

| Role    | Access                                       |
|---------|----------------------------------------------|
| student | Browse & take exams, history, leaderboard, profile |
| admin   | Everything above + admin panel (users/exams/questions) |
