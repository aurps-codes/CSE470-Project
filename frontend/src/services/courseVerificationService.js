import { apiRequest, openFile } from "./api";

// ----- Teacher -----

export function submitRequest(subject, files) {
  // Files cannot be sent as JSON, so we use FormData (a "form with files")
  const formData = new FormData();
  formData.append("subject", subject);
  for (const file of files) {
    formData.append("files", file);
  }
  return apiRequest("/course-verifications", "POST", formData);
}

export function getMyRequests() {
  return apiRequest("/course-verifications/mine");
}

export function getVerifiedSubjects() {
  return apiRequest("/course-verifications/verified-subjects");
}

// ----- Admin -----

export function getRequests(status) {
  return apiRequest("/course-verifications?status=" + status);
}

export function approveRequest(requestId) {
  return apiRequest("/course-verifications/" + requestId + "/approve", "POST");
}

export function rejectRequest(requestId, reason) {
  return apiRequest("/course-verifications/" + requestId + "/reject", "POST", {
    reason: reason,
  });
}

// ----- Files (admin, or the teacher who uploaded them) -----

export function openVerificationFile(requestId, storedName) {
  return openFile("/course-verifications/" + requestId + "/files/" + storedName);
}
