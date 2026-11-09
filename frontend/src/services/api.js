const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

export async function apiRequest(path, method = "GET", body = null) {
  const headers = { "Content-Type": "application/json" };

  const token = localStorage.getItem("token");
  if (token) {
    headers["Authorization"] = "Bearer " + token;
  }

  const response = await fetch(API_URL + path, {
    method: method,
    headers: headers,
    body: body ? JSON.stringify(body) : null,
  });

  const data = await response.json();

  if (!response.ok) {
    // Session expired or invalid: clear it and go to login
    if (response.status === 401 && token) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    // Our own errors give a string; validation errors give a list
    let message = "Something went wrong.";
    if (typeof data.detail === "string") {
      message = data.detail;
    } else if (Array.isArray(data.detail)) {
      message = data.detail[0].msg;
    }
    throw new Error(message);
  }

  return data;
}