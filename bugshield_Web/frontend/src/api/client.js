const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export function getToken() {
  return localStorage.getItem("bugshield_token");
}

export function setSession(token, user) {
  localStorage.setItem("bugshield_token", token);
  localStorage.setItem("bugshield_user", JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem("bugshield_token");
  localStorage.removeItem("bugshield_user");
}

export function getUser() {
  const raw = localStorage.getItem("bugshield_user");
  return raw ? JSON.parse(raw) : null;
}

export async function api(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (options.body && !(options.body instanceof FormData)) headers["Content-Type"] = "application/json";
  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(error.detail || "Request failed");
  }
  const type = response.headers.get("content-type") || "";
  if (type.includes("application/json")) return response.json();
  return response.blob();
}

export { API_URL };
