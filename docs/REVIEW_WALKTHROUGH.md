# Task 3 Live Review Walkthrough

Use this as your own practice checklist for the live code walkthrough.

1. **Show the project structure.** Explain why routes, controllers, model, middleware, and configuration are separated.
2. **Register a new user.** Explain validation and why the server hashes the password before storing it.
3. **Show MongoDB.** Open the user document and show that `password` is a bcrypt hash, not the password you typed. Do not show real credentials.
4. **Sign in.** Explain `bcrypt.compare`, JWT signing, expiry, and the HttpOnly cookie.
5. **Show the protected endpoint.** Open the browser DevTools Network panel and find `GET /api/users/me`. Explain that middleware verifies the JWT before returning profile data.
6. **Try an incorrect password.** Show the generic `Invalid email or password` response.
7. **Try a duplicate email.** Show the `409 Conflict` response.
8. **Log out.** Explain that the cookie is cleared and the frontend discards its in-memory bearer token.
9. **Explain a limitation honestly.** A stateless JWT bearer token cannot be instantly revoked unless a server-side session store or denylist is implemented.
10. **Show the Postman collection and API documentation.**

Be prepared to explain every line you submit. Do not claim the app was deployed or tested in an environment you have not actually run.
