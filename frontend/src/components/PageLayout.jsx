import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { styles } from "../styles/theme";

// Wide page with a header (brand + user name + log out), used by the dashboard pages
export default function PageLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <div style={styles.wideWrapper}>
      <div style={styles.header}>
        <div
          style={{ ...styles.brand, cursor: "pointer" }}
          onClick={() => navigate("/dashboard")}
        >
          TutorNest
        </div>
        <div style={styles.headerRight}>
          <span>
            {user.full_name} ({user.role})
          </span>
          <button type="button" style={styles.linkButton} onClick={handleLogout}>
            Log out
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}
