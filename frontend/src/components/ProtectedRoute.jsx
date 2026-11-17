import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { styles } from "../styles/theme";

// role is optional: when given, only users with that role may open the page
export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <p style={styles.centerText}>Loading...</p>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (role && user.role !== role) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}