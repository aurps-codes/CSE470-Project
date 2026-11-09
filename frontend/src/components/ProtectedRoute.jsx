import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { styles } from "../styles/theme";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <p style={styles.centerText}>Loading...</p>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}