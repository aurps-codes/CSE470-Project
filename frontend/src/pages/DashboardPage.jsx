import { Link } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import PostFeed from "../components/PostFeed";
import { useAuth } from "../context/AuthContext";
import { styles } from "../styles/theme";

// A very simple dashboard. The full role-based dashboards (R3) will be built later;
// for now it shows the menu links our features need and the latest posts.
export default function DashboardPage() {
  const { user } = useAuth();
  const canPost = user.role === "student" || user.role === "teacher";

  return (
    <PageLayout>
      <div style={styles.panel}>
        <h2 style={styles.panelTitle}>Hello, {user.full_name}!</h2>
        <p style={styles.mutedText}>
          You are logged in as a <strong>{user.role}</strong>.
        </p>

        <div style={styles.menuColumn}>
          {canPost && (
            <Link to="/posts/new" style={styles.menuLink}>
              {user.role === "teacher" ? "Create a Teaching Offer" : "Create a Tuition Request"}
            </Link>
          )}

          {canPost && (
            <Link to="/my-posts" style={styles.menuLink}>
              My Posts
            </Link>
          )}

          {user.role === "teacher" && (
            <Link to="/verify-course" style={styles.menuLink}>
              Verify a Course
            </Link>
          )}

          {user.role === "admin" && (
            <Link to="/admin/course-verifications" style={styles.menuLink}>
              Review Course Verifications
            </Link>
          )}
        </div>
      </div>

      <div style={styles.panel}>
        <div style={styles.requestTop}>
          <h2 style={{ ...styles.panelTitle, margin: 0 }}>Latest Posts</h2>
          <Link to="/posts" style={styles.link}>
            See all posts
          </Link>
        </div>
        <div style={{ height: "14px" }} />
        <PostFeed pageSize={5} />
      </div>
    </PageLayout>
  );
}
