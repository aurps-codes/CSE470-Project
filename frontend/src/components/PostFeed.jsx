import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import * as postService from "../services/postService";
import { styles } from "../styles/theme";
import PostCard from "./PostCard";

const TABS = [
  { value: "", label: "All" },
  { value: "student", label: "Student requests" },
  { value: "teacher", label: "Teacher offers" },
];

// The list of latest posts with All / Student requests / Teacher offers tabs.
// Used on the dashboard (small page size) and on the "All posts" page (with "Load more").
export default function PostFeed({ pageSize, allowLoadMore = false }) {
  const { user } = useAuth();
  const [postType, setPostType] = useState("");
  const [posts, setPosts] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [loadedType, setLoadedType] = useState(null); // which tab the shown posts belong to
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  // Load the first page again whenever the tab changes
  useEffect(() => {
    let ignore = false; // stops an old, slow answer from replacing a newer one

    postService
      .getPosts(postType, 0, pageSize)
      .then((data) => {
        if (ignore) return;
        setPosts(data);
        setHasMore(data.length === pageSize);
        setLoadedType(postType);
        setError("");
      })
      .catch((err) => {
        if (ignore) return;
        setError(err.message);
        setLoadedType(postType);
      });

    return () => {
      ignore = true;
    };
  }, [postType, pageSize]);

  async function handleLoadMore() {
    setLoadingMore(true);
    try {
      const data = await postService.getPosts(postType, posts.length, pageSize);
      setPosts([...posts, ...data]);
      setHasMore(data.length === pageSize);
    } catch (err) {
      setError(err.message);
    }
    setLoadingMore(false);
  }

  async function handleDelete(post) {
    if (!window.confirm('Delete the post "' + post.title + '"?')) {
      return;
    }
    try {
      await postService.deletePost(post.id);
      setPosts(posts.filter((item) => item.id !== post.id));
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  const loading = loadedType !== postType;

  return (
    <div>
      <div style={styles.tabRow}>
        {TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            style={{
              ...styles.roleButton,
              textTransform: "none",
              ...(postType === tab.value ? styles.roleButtonActive : {}),
            }}
            onClick={() => setPostType(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}
      {loading && !error && <p style={styles.mutedText}>Loading...</p>}
      {!loading && !error && posts.length === 0 && (
        <p style={styles.mutedText}>No posts yet.</p>
      )}

      {!loading &&
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onDelete={post.author_id === user.id ? handleDelete : undefined}
          />
        ))}

      {!loading && allowLoadMore && hasMore && (
        <button
          type="button"
          style={{ ...styles.linkButton, display: "block", margin: "0 auto" }}
          disabled={loadingMore}
          onClick={handleLoadMore}
        >
          {loadingMore ? "Loading..." : "Load more"}
        </button>
      )}
    </div>
  );
}
