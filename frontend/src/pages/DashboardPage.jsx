import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import PrimaryButton from "../components/PrimaryButton";
import { useAuth } from "../context/AuthContext";
import { styles } from "../styles/theme";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <AuthLayout subtitle={"Hello, " + user.full_name + "!"}>
      <p style={styles.centerText}>
        You are logged in as a <strong>{user.role}</strong>.
      </p>
      <PrimaryButton text="Log out" type="button" onClick={handleLogout} />
    </AuthLayout>
  );
}