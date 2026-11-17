const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

export async function apiRequest(path, method = "GET", body = null) {
  // A form with files is sent as FormData; the browser sets its Content-Type itself
  const isForm = body instanceof FormData;
  const headers = {};
  if (!isForm) {
    headers["Content-Type"] = "application/json";
  }

  const token = localStorage.getItem("token");
  if (token) {
    headers["Authorization"] = "Bearer " + token;
  }

  const response = await fetch(API_URL + path, {
    method: method,
    headers: headers,
    body: body ? (isForm ? body : JSON.stringify(body)) : null,
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

// Files are protected (they need the login token), so a plain link will not work.
// We download the file with the token and show it in a new tab.
export async function openFile(path) {
  // Open the tab right now (inside the click), otherwise the browser blocks the popup
  const newTab = window.open("", "_blank");

  try {
    const response = await fetch(API_URL + path, {
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
    });
    if (!response.ok) {
      throw new Error("Could not open the file.");
    }
    const blob = await response.blob();
    newTab.location.href = URL.createObjectURL(blob);
  } catch (error) {
    if (newTab) {
      newTab.close();
    }
    throw error;
  }
}