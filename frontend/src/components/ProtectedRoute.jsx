import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { styles } from "../styles/theme";

// role is optional: when given, only users with that role may open the page.
// It can be one role ("admin") or a list of roles (["student", "teacher"]).
export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <p style={styles.centerText}>Loading...</p>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (role && ![].concat(role).includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}