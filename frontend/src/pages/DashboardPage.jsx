import { Link } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import { useAuth } from "../context/AuthContext";
import { styles } from "../styles/theme";

// A very simple dashboard. The full role-based dashboards (R3) will be built later;
// for now it only shows the menu links that the course verification feature needs.
export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <PageLayout>
      <div style={styles.panel}>
        <h2 style={styles.panelTitle}>Hello, {user.full_name}!</h2>
        <p style={styles.mutedText}>
          You are logged in as a <strong>{user.role}</strong>.
        </p>

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
    </PageLayout>
  );
}
