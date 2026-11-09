import { apiRequest } from "./api";

export function signup(fullName, email, password, role) {
  return apiRequest("/auth/signup", "POST", {
    full_name: fullName,
    email: email,
    password: password,
    role: role,
  });
}

export function login(email, password) {
  return apiRequest("/auth/login", "POST", { email: email, password: password });
}

export function verifyOtp(email, otp, purpose) {
  return apiRequest("/auth/verify-otp", "POST", {
    email: email,
    otp: otp,
    purpose: purpose,
  });
}

export function getMe() {
  return apiRequest("/auth/me");
}

export function logout() {
  return apiRequest("/auth/logout", "POST");
}