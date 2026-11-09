import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import FormInput from "../components/FormInput";
import PrimaryButton from "../components/PrimaryButton";
import * as authService from "../services/authService";
import { styles } from "../styles/theme";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authService.signup(fullName, email, password, role);
      navigate("/verify-otp", { state: { email: email, purpose: "signup" } });
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  }

  return (
    <AuthLayout subtitle="Create your account">
      <form onSubmit={handleSubmit}>
        {error && <div style={styles.errorBox}>{error}</div>}

        <div style={styles.formGroup}>
          <label style={styles.label}>I am a</label>
          <div style={styles.roleRow}>
            {["student", "teacher", "parent"].map((r) => (
              <button
                type="button"
                key={r}
                style={
                  role === r
                    ? { ...styles.roleButton, ...styles.roleButtonActive }
                    : styles.roleButton
                }
                onClick={() => setRole(r)}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <FormInput
          label="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Your name"
        />
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
          placeholder="At least 8 characters"
        />

        <PrimaryButton
          text={loading ? "Sending code..." : "Sign up"}
          disabled={loading}
        />

        <p style={styles.switchText}>
          Already have an account?{" "}
          <Link to="/login" style={styles.link}>
            Log in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}