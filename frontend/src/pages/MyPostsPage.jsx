import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import PostCard from "../components/PostCard";
import * as postService from "../services/postService";
import { styles } from "../styles/theme";

// Shows the logged-in user's own posts, and lets them delete a post
export default function MyPostsPage() {
  const [posts, setPosts] = useState(null); // null means "still loading"
  const [error, setError] = useState("");

  useEffect(() => {
    postService
      .getMyPosts()
      .then((data) => setPosts(data))
      .catch((err) => setError(err.message));
  }, []);

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

  return (
    <PageLayout>
      <p style={styles.mutedText}>
        <Link to="/dashboard" style={styles.link}>
          &larr; Back to dashboard
        </Link>
      </p>

      <div style={styles.panel}>
        <div style={styles.requestTop}>
          <h2 style={{ ...styles.panelTitle, margin: 0 }}>My Posts</h2>
          <Link to="/posts/new" style={styles.link}>
            + New post
          </Link>
        </div>
        <div style={{ height: "14px" }} />

        {error && <div style={styles.errorBox}>{error}</div>}
        {posts === null && !error && <p style={styles.mutedText}>Loading...</p>}
        {posts !== null && posts.length === 0 && (
          <p style={styles.mutedText}>You have not posted anything yet.</p>
        )}

        {posts !== null &&
          posts.map((post) => <PostCard key={post.id} post={post} onDelete={handleDelete} />)}
      </div>
    </PageLayout>
  );
}
