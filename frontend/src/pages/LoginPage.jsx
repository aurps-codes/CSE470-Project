import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import FormInput from "../components/FormInput";
import PrimaryButton from "../components/PrimaryButton";
import * as authService from "../services/authService";
import { styles } from "../styles/theme";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authService.login(email, password);
      navigate("/verify-otp", { state: { email: email, purpose: "login" } });
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  }

  return (
    <AuthLayout subtitle="Welcome back">
      <form onSubmit={handleSubmit}>
        {error && <div style={styles.errorBox}>{error}</div>}

        <FormInput
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
        <FormInput
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your password"
        />

        <PrimaryButton text={loading ? "Checking..." : "Log in"} disabled={loading} />

        <p style={styles.switchText}>
          New here?{" "}
          <Link to="/register" style={styles.link}>
            Create an account
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}