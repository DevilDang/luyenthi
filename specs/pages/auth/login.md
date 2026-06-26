# Page Spec — Login

**Route:** `/login`  
**File:** [frontend/src/pages/auth/LoginPage.jsx](../../../frontend/src/pages/auth/LoginPage.jsx)  
**Auth required:** No — redirects to `/` if already authenticated

---

## Purpose

Entry point for the application. Authenticates users via Google OAuth using Firebase, then exchanges the Firebase ID token for an application JWT.

---

## Layout

```
┌────────────────────────────────────────────────────────────┐
│  ☁  ☁  ☁  (animated drifting clouds)                      │
│                  ✦ ✦ ✦ (twinkling stars)                  │
│                                                             │
│          ┌──────────────────────────────────┐              │
│          │   🔵  LuyenThi                   │              │
│          │                                  │              │
│          │   Nền tảng luyện thi thông minh  │              │
│          │   (tagline)                      │              │
│          │                                  │              │
│          │  [🌐 Đăng nhập với Google]       │              │
│          │                                  │              │
│          │  [error message if any]          │              │
│          └──────────────────────────────────┘              │
│                                                             │
│  [Doraemon character sprites — decorative]                 │
└────────────────────────────────────────────────────────────┘
```

Themed with Doraemon aesthetics: blue/white gradient background, animated clouds and stars, character sprite decorations.

---

## UI States

| State          | Description                                                      |
|----------------|------------------------------------------------------------------|
| Idle           | "Đăng nhập với Google" button enabled                           |
| Signing in     | Button shows "Đang đăng nhập..." and is disabled                |
| Error          | Red error message shown below button; button re-enabled         |

---

## Behaviour

### Sign-in Flow

1. User clicks "Đăng nhập với Google".
2. Firebase Google OAuth popup opens.
3. On success: `firebase.auth().signInWithPopup()` returns credential.
4. Extract `idToken` from the credential.
5. Call `POST /api/auth/google` with `{id_token}`.
6. Store returned JWT in `localStorage`.
7. Set user in `AuthContext`.
8. Navigate to `/` (dashboard).

### Error Handling

| Error code                          | Displayed message               |
|-------------------------------------|---------------------------------|
| `auth/popup-closed-by-user`         | Silently ignored (no message)   |
| `auth/network-request-failed`       | Generic network error message   |
| API 401                             | "Đăng nhập thất bại" or similar |
| Any other                           | `error.message` from Firebase   |

---

## Navigation

| Condition             | Destination |
|-----------------------|-------------|
| Already authenticated | `/`         |
| Successful login      | `/`         |

---

## Components Used

- Firebase `signInWithPopup` (Google provider)
- `AuthContext.login(idToken)`
- `useNavigate` (React Router)

---

## Accessibility

- Button includes `aria-busy` during loading state.
- Error message has `role="alert"`.
