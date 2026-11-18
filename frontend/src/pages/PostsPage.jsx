import { Link } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import PostFeed from "../components/PostFeed";
import { styles } from "../styles/theme";

// All posts from students (requests) and teachers (offers), newest first
export default function PostsPage() {
  return (
    <PageLayout>
      <p style={styles.mutedText}>
        <Link to="/dashboard" style={styles.link}>
          &larr; Back to dashboard
        </Link>
      </p>

      <div style={styles.panel}>
        <h2 style={styles.panelTitle}>All Posts</h2>
        <PostFeed pageSize={10} allowLoadMore />
      </div>
    </PageLayout>
  );
}
