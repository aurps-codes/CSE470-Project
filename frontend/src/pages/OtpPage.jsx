import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import FormInput from "../components/FormInput";
import PrimaryButton from "../components/PrimaryButton";
import { useAuth } from "../context/AuthContext";
import * as authService from "../services/authService";
import { styles } from "../styles/theme";

export default function OtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { saveLogin } = useAuth();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If someone opens /verify-otp directly, there is no email to verify
  if (!location.state) {
    return <Navigate to="/login" replace />;
  }

  const email = location.state.email;
  const purpose = location.state.purpose;

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await authService.verifyOtp(email, otp, purpose);
      saveLogin(data.token, data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  }

  return (
    <AuthLayout subtitle={"Enter the 6-digit code sent to " + email}>
      <form onSubmit={handleSubmit}>
        {error && <div style={styles.errorBox}>{error}</div>}

        <FormInput
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          placeholder="000000"
          maxLength={6}
          inputMode="numeric"
          extraStyle={styles.otpInput}
        />

        <PrimaryButton
          text={loading ? "Verifying..." : "Verify"}
          disabled={loading || otp.length !== 6}
        />

        <p style={styles.switchText}>
          Code not received or expired?{" "}
          <Link to={purpose === "signup" ? "/register" : "/login"} style={styles.link}>
            Go back
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}