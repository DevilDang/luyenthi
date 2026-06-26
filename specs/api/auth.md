# API Spec — Auth

Base prefix: `/api/auth`

---

## POST /api/auth/google

Exchange a Firebase ID token for an application JWT.

**Auth required:** No (public endpoint)

### Request

```json
{
  "id_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

| Field      | Type   | Required | Description                          |
|------------|--------|----------|--------------------------------------|
| `id_token` | string | yes      | Firebase ID token from Google OAuth  |

### Success Response `200 OK`

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "abc123",
    "email": "user@gmail.com",
    "name": "Nguyen Van A",
    "photo_url": "https://lh3.googleusercontent.com/...",
    "role": "student",
    "grade_level": "general",
    "age": 0,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### Error Responses

| Status | Body                              | Condition                        |
|--------|-----------------------------------|----------------------------------|
| 400    | `{"error": "id_token is required"}` | Missing field                 |
| 401    | `{"error": "invalid Firebase token"}` | Token verification failed   |
| 500    | `{"error": "..."}` | Firestore write error, JWT creation failure |

### Backend Behaviour

1. Verify `id_token` with Firebase Admin SDK → extract `{uid, email, name, picture}`.
2. Query Firestore for user doc by `google_id == uid`.
3. **New user**: create user doc with `role=student`, `grade_level=general`; create `user_stats` doc.
4. **Existing user**: sync `name` and `photo_url` from Firebase claims.
5. Create HS256 JWT (`{user_id, email, role}`, 72-hour expiry) using `JWT_SECRET`.
6. Return `{token, user}`.

---

## GET /api/auth/me

Return the authenticated user's profile.

**Auth required:** Yes — `Authorization: Bearer <token>`

### Success Response `200 OK`

```json
{
  "id": "abc123",
  "email": "user@gmail.com",
  "name": "Nguyen Van A",
  "photo_url": "https://lh3.googleusercontent.com/...",
  "role": "student",
  "grade_level": "grade-10",
  "age": 16,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-06-01T00:00:00Z"
}
```

### Error Responses

| Status | Body                         | Condition                     |
|--------|------------------------------|-------------------------------|
| 401    | `{"error": "unauthorized"}`  | Missing or invalid JWT        |
| 404    | `{"error": "user not found"}` | User doc deleted from Firestore |
| 500    | `{"error": "..."}` | Firestore read error          |

---

## JWT Token Spec

| Claim     | Type   | Description                |
|-----------|--------|----------------------------|
| `user_id` | string | Firestore document ID      |
| `email`   | string | Google email               |
| `role`    | string | `"student"` or `"admin"`   |
| `exp`     | int64  | Unix timestamp, 72h expiry |

Algorithm: **HS256**. Secret loaded from `JWT_SECRET` env var (dev) or GCP Secret Manager (prod).

### Frontend JWT Lifecycle

1. Token stored in `localStorage` under key `token`.
2. Axios request interceptor reads `localStorage.getItem('token')` and sets `Authorization: Bearer <token>`.
3. Axios response interceptor: on `401`, clears `localStorage` token and redirects to `/login`.
4. On app start, `AuthContext` validates the stored token via `GET /api/auth/me`; if it fails, re-exchanges a fresh Firebase ID token via `POST /api/auth/google`.
