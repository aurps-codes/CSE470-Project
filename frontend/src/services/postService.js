import { apiRequest } from "./api";

// Dropdown choices (class levels, days, time slots)
export function getOptions() {
  return apiRequest("/posts/options");
}

export function createPost(data) {
  return apiRequest("/posts", "POST", data);
}

// postType is "student", "teacher" or "" (both)
export function getPosts(postType, skip, limit) {
  let path = "/posts?skip=" + skip + "&limit=" + limit;
  if (postType) {
    path += "&post_type=" + postType;
  }
  return apiRequest(path);
}

export function getMyPosts() {
  return apiRequest("/posts/mine");
}

export function deletePost(postId) {
  return apiRequest("/posts/" + postId, "DELETE");
}
