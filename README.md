# Task 3 — Authentication System

A full-stack authentication project created to meet the **WeIntern Week 2 Full Stack Development Task 3** requirements.

## Features

- Registration with username, email, and password
- Input validation and duplicate-email handling
- bcrypt password hashing (12 salt rounds)
- Login with database credential verification
- JWT authentication with expiry, issuer, and audience validation
- HttpOnly cookie session plus bearer-token support for API clients
- Protected `GET /api/users/me` endpoint
- Dashboard showing safe user profile information
- Logout that clears the HttpOnly cookie, increments the account token version, and invalidates previously issued JWTs
- Helpful error messages for invalid credentials and invalid sessions
- Express rate limiting, Helmet security headers, and centralized error handling
- Responsive frontend for desktop, tablet, and mobile
- API documentation and Postman collection

## Technology stack

- Frontend: HTML5, CSS3, JavaScript
- Backend: Node.js, Express
- Database: MongoDB with Mongoose
- Password hashing: bcryptjs
- Session/authentication: JSON Web Token (JWT), HttpOnly cookie

## Prerequisites

Install Node.js 18 or newer and MongoDB. You can use local MongoDB or a MongoDB Atlas database.

## Run locally

1. Extract the ZIP and open the project folder in VS Code.
2. Open a terminal in the project folder.
3. Install packages:

   ```bash
   npm install
   ```

4. Copy `.env.example` to `.env`.
   - Windows Command Prompt: `copy .env.example .env`
   - PowerShell: `Copy-Item .env.example .env`
   - macOS/Linux: `cp .env.example .env`

5. Edit `.env`:
   - `MONGODB_URI`: local MongoDB URI or your Atlas connection string.
   - `JWT_SECRET`: replace the example with a long random secret of at least 32 characters.
   - Keep `.env` private. Do not upload it to GitHub.

   Example local settings:

   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/task3_authentication
   JWT_SECRET=use_a_long_random_secret_string_here_at_least_32_chars
   JWT_EXPIRES_IN=1h
   NODE_ENV=development
   ```

6. Start the server:

   ```bash
   npm run dev
   ```

   Or run without nodemon:

   ```bash
   npm start
   ```

7. Open **http://localhost:5000** in your browser.

The server connects to MongoDB before it begins listening. If the connection fails, check that MongoDB is running, the URI is correct, and your Atlas IP access list and database user are configured.

## How to test the app

1. Select **Create account**.
2. Enter a username (3–30 letters, numbers or underscores), email, and password (at least 8 characters).
3. Submit and confirm the dashboard appears.
4. Refresh the page to check that the cookie session restores the dashboard.
5. Log out.
6. Sign in with the same credentials.
7. Try a wrong password and verify that a generic error appears.
8. Try registering with the same email and verify that the app reports a duplicate account.
9. Open `http://localhost:5000/api/users/me` in a private/incognito window. It should return `401` without a valid session.

## API endpoints

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/api/health` | Public | Check server status |
| POST | `/api/auth/register` | Public | Register a user |
| POST | `/api/auth/login` | Public | Log in |
| POST | `/api/auth/logout` | Public | Clear the cookie session |
| GET | `/api/users/me` | Protected | Get current user profile |

Full request and response examples are in [`docs/API_DOCUMENTATION.md`](docs/API_DOCUMENTATION.md). Import [`postman/Task3-Authentication.postman_collection.json`](postman/Task3-Authentication.postman_collection.json) into Postman to test the endpoints.

## Project structure

```text
Task3_Authentication_System/
├── public/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── src/
│   ├── config/db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   ├── models/User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── userRoutes.js
│   └── utils/createToken.js
├── docs/API_DOCUMENTATION.md
├── postman/Task3-Authentication.postman_collection.json
├── .env.example
├── .gitignore
├── package.json
└── server.js
```

## How it works

1. Registration validates user input, hashes the password with bcrypt, and stores the hash—not the original password—in MongoDB.
2. Login fetches the user and compares the submitted password against the stored hash using `bcrypt.compare`.
3. On success, the server signs a JWT and sends it in an HttpOnly cookie; the API response also returns a token for API-client testing. The browser UI keeps the token in memory, not localStorage.
4. Protected middleware reads a bearer token or cookie, verifies the JWT, then loads the user from MongoDB.
5. The dashboard requests `/api/users/me`; without a valid session, the API returns `401`.
6. Logout clears the cookie and removes the browser's in-memory token.

## Security notes and limitations

- Never store plaintext passwords.
- Never commit `.env` or production secrets to GitHub.
- Use HTTPS in production and set `NODE_ENV=production`.
- Logout increments the user's tokenVersion in MongoDB, invalidating all previously issued JWTs for that account. This also signs out other sessions for that user; login creates a fresh token version.
- If you deploy with cookie-based authentication, evaluate CSRF protections and configure CORS/cookie settings for your deployment topology.
- This is an educational assignment starter, not a substitute for a security review before handling real users.

## Assignment submission checklist

- [x] Source code with a separate auth module
- [x] Registration, login, protected profile route, logout
- [x] Password hashing and input validation
- [x] Documentation of authentication endpoints
- [x] README with setup instructions and security notes
- [x] Postman collection
- [ ] Capture your own screenshots after running the project
- [ ] Record a demo showing registration, login, protected access, and logout
- [ ] Upload source and documentation to the assigned Google Drive folder

The handbook specifically asks for screenshots/demo video and a live code walkthrough. Those must be recorded from your running copy; they are not fabricated in this ZIP.
