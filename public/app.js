const authView = document.getElementById("auth-view");
const dashboardView = document.getElementById("dashboard-view");
const form = document.getElementById("auth-form");
const messageBox = document.getElementById("message");
const usernameField = document.getElementById("username-field");
const usernameInput = document.getElementById("username");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginTab = document.getElementById("login-tab");
const registerTab = document.getElementById("register-tab");
const switchLink = document.getElementById("switch-link");
const passwordHelp = document.getElementById("password-help");
let mode = "login";
let busy = false;

function showMessage(text, kind = "error") {
  messageBox.textContent = text;
  messageBox.className = `message ${kind}`;
  messageBox.hidden = false;
}
function clearMessage() {
  messageBox.hidden = true;
  messageBox.textContent = "";
}
function setMode(nextMode) {
  mode = nextMode;
  clearMessage();
  const registering = mode === "register";
  usernameField.hidden = !registering;
  usernameInput.required = registering;
  passwordInput.autocomplete = registering ? "new-password" : "current-password";
  passwordHelp.hidden = !registering;
  document.getElementById("form-kicker").textContent = registering ? "GET STARTED" : "WELCOME BACK";
  document.getElementById("form-title").textContent = registering ? "Create your account" : "Sign in to your account";
  document.getElementById("form-subtitle").textContent = registering
    ? "Create an account to access your private dashboard."
    : "Enter your details to continue to your dashboard.";
  document.getElementById("submit-label").textContent = registering ? "Create account securely" : "Sign in securely";
  loginTab.classList.toggle("active", !registering);
  registerTab.classList.toggle("active", registering);
  loginTab.setAttribute("aria-selected", String(!registering));
  registerTab.setAttribute("aria-selected", String(registering));
  document.getElementById("switch-copy").innerHTML = registering
    ? 'Already have an account? <button type="button" class="text-button" id="switch-link">Sign in</button>'
    : 'New to SecureSpace? <button type="button" class="text-button" id="switch-link">Create an account</button>';
  document.getElementById("switch-link").addEventListener("click", () => setMode(registering ? "login" : "register"));
  passwordInput.minLength = registering ? 8 : 1;
  passwordInput.value = "";
}
loginTab.addEventListener("click", () => setMode("login"));
registerTab.addEventListener("click", () => setMode("register"));
switchLink.addEventListener("click", () => setMode("register"));

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) }
  });
  let payload = {};
  try { payload = await response.json(); } catch (_error) {}
  if (!response.ok) throw new Error(payload.message || "Request failed. Please try again.");
  return payload;
}

function setBusy(value) {
  busy = value;
  const button = document.getElementById("submit-button");
  button.disabled = value;
  document.getElementById("submit-label").textContent = value
    ? "Please wait…"
    : (mode === "register" ? "Create account securely" : "Sign in securely");
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (busy) return;
  clearMessage();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const username = usernameInput.value.trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showMessage("Please enter a valid email address.");
  if (mode === "register" && !/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
    return showMessage("Username must be 3–30 characters and use letters, numbers or underscores.");
  }
  if (mode === "register" && (password.length < 8 || password.length > 72)) {
    return showMessage("Password must be between 8 and 72 characters.");
  }
  if (!password) return showMessage("Please enter your password.");

  setBusy(true);
  try {
    const endpoint = mode === "register" ? "/api/auth/register" : "/api/auth/login";
    const body = mode === "register" ? { username, email, password } : { email, password };
    const result = await apiRequest(endpoint, { method: "POST", body: JSON.stringify(body) });
    // The server also sets an HttpOnly cookie. Keep the returned JWT in memory, not localStorage.
    window.sessionToken = result.token;
    await loadDashboard();
  } catch (error) {
    showMessage(error.message);
  } finally {
    setBusy(false);
  }
});

async function loadDashboard() {
  const headers = window.sessionToken ? { Authorization: `Bearer ${window.sessionToken}` } : {};
  const result = await apiRequest("/api/users/me", { headers });
  const user = result.user;
  document.getElementById("dash-username").textContent = user.username;
  document.getElementById("avatar").textContent = user.username.charAt(0).toUpperCase();
  document.getElementById("profile-username").textContent = user.username;
  document.getElementById("profile-email").textContent = user.email;
  document.getElementById("profile-created").textContent = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
    : "—";
  authView.hidden = true;
  dashboardView.hidden = false;
}

document.getElementById("logout-button").addEventListener("click", async () => {
  try {
    await apiRequest("/api/auth/logout", { method: "POST", body: "{}" });
  } catch (_error) {
    // Still clear client-side session state if the network request fails.
  }
  window.sessionToken = null;
  dashboardView.hidden = true;
  authView.hidden = false;
  form.reset();
  setMode("login");
  showMessage("You have been logged out.", "success");
});

// Cookie sessions can restore the dashboard after refresh. If there is no valid cookie,
// the protected endpoint rejects the request and the login screen remains visible.
(async function restoreSession() {
  try {
    const result = await apiRequest("/api/users/me");
    const user = result.user;
    document.getElementById("dash-username").textContent = user.username;
    document.getElementById("avatar").textContent = user.username.charAt(0).toUpperCase();
    document.getElementById("profile-username").textContent = user.username;
    document.getElementById("profile-email").textContent = user.email;
    document.getElementById("profile-created").textContent = user.createdAt
      ? new Date(user.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
      : "—";
    authView.hidden = true;
    dashboardView.hidden = false;
  } catch (_error) {
    // Expected when a user has not signed in yet.
  }
})();
