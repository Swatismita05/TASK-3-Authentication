# Authentication API Documentation

Base URL: `http://localhost:5000`

All request bodies use JSON. Responses use JSON. Passwords are never returned by the API.

## `POST /api/auth/register`

Create a new user.

**Body**
```json
{
  "username": "alex_morgan",
  "email": "alex@example.com",
  "password": "correct-horse-123"
}
```

**Success:** `201 Created`
```json
{
  "message": "Account created successfully.",
  "token": "<JWT>",
  "user": {
    "id": "<user-id>",
    "username": "alex_morgan",
    "email": "alex@example.com",
    "createdAt": "<ISO date>"
  }
}
```

Possible errors: `400` invalid/missing input, `409` duplicate email, `500` server error.

## `POST /api/auth/login`

Validate credentials and create a session.

**Body**
```json
{ "email": "alex@example.com", "password": "correct-horse-123" }
```

**Success:** `200 OK` with `message`, `token`, and safe `user` object. The server also sets an HttpOnly `authToken` cookie.

Possible errors: `400` missing fields, `401` invalid email or password.

## `GET /api/users/me` — Protected

Returns the authenticated user's safe profile.

For API clients, send:
`Authorization: Bearer <JWT>`

Browser clients may use the HttpOnly cookie set during registration/login.

**Success:** `200 OK`
```json
{
  "user": {
    "_id": "<user-id>",
    "username": "alex_morgan",
    "email": "alex@example.com",
    "createdAt": "<ISO date>"
  }
}
```

Possible errors: `401` missing, invalid, expired, or no-longer-valid session.

## `POST /api/auth/logout`

Clears the browser's HttpOnly cookie.

**Success:** `200 OK`
```json
{ "message": "Logged out successfully. Remove any locally stored bearer token." }
```

For clients that store bearer tokens, delete the token on logout. This demo keeps the token in browser memory rather than persistent localStorage. Stateless JWT bearer tokens cannot be individually revoked without a server-side denylist/session store; they expire naturally. Cookie logout clears the browser session cookie.

## `GET /api/health`

Public health endpoint. Returns status and a short message.

## Validation and security notes

- Passwords are hashed using bcrypt with 12 salt rounds.
- Email addresses are trimmed and lowercased.
- Username is limited to letters, numbers, and underscores.
- Password length is 8–72 characters to match bcrypt's byte-length limit for this simple ASCII-oriented demo.
- Duplicate emails are prevented by a unique database index and duplicate-key error handling.
- JWT verification checks signature, expiry, issuer, and audience.
- Authentication routes are rate-limited; Helmet adds standard HTTP security headers.
- Production deployments must use HTTPS, a strong secret stored outside source control, secure cookies, and appropriate CSRF protections if relying on cookie authentication.
