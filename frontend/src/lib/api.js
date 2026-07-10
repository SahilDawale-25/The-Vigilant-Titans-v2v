import { auth } from "./firebase";

const API_BASE_URL = "http://localhost:8000";

export async function apiCall(endpoint, options = {}) {
  const user = auth.currentUser;

  console.log("Current user:", user);

  const token = user ? await user.getIdToken() : null;

  console.log("Token:", token);

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  console.log("Headers:", headers);

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}