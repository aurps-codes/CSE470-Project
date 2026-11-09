export const colors = {
  primary: "#4f46e5",
  primaryDark: "#4338ca",
  text: "#1f2937",
  muted: "#6b7280",
  border: "#d1d5db",
  errorBackground: "#fee2e2",
  errorText: "#b91c1c",
};

export const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    boxSizing: "border-box",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    background: "#ffffff",
    padding: "36px 32px",
    borderRadius: "16px",
    boxShadow: "0 10px 30px rgba(79, 70, 229, 0.15)",
    boxSizing: "border-box",
  },
  brand: {
    textAlign: "center",
    fontSize: "28px",
    fontWeight: "700",
    color: colors.primary,
  },
  subtitle: {
    textAlign: "center",
    color: colors.muted,
    margin: "4px 0 24px",
  },
  formGroup: {
    marginBottom: "16px",
  },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "600",
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    border: "1px solid " + colors.border,
    borderRadius: "10px",
    fontSize: "15px",
    boxSizing: "border-box",
    outline: "none",
  },
  inputFocused: {
    border: "1px solid " + colors.primary,
    boxShadow: "0 0 0 3px rgba(79, 70, 229, 0.2)",
  },
  otpInput: {
    textAlign: "center",
    fontSize: "26px",
    letterSpacing: "10px",
  },
  roleRow: {
    display: "flex",
    gap: "8px",
  },
  roleButton: {
    flex: 1,
    padding: "10px",
    border: "1px solid " + colors.border,
    background: "#ffffff",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "14px",
    textTransform: "capitalize",
  },
  roleButtonActive: {
    background: colors.primary,
    border: "1px solid " + colors.primary,
    color: "#ffffff",
  },
  primaryButton: {
    width: "100%",
    padding: "12px",
    border: "none",
    borderRadius: "10px",
    background: colors.primary,
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
  },
  primaryButtonHover: {
    background: colors.primaryDark,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
  errorBox: {
    background: colors.errorBackground,
    color: colors.errorText,
    padding: "10px 12px",
    borderRadius: "8px",
    fontSize: "14px",
    marginBottom: "16px",
  },
  switchText: {
    textAlign: "center",
    marginTop: "20px",
    fontSize: "14px",
    color: colors.muted,
  },
  link: {
    color: colors.primary,
    fontWeight: "600",
    textDecoration: "none",
  },
  centerText: {
    textAlign: "center",
    padding: "16px",
  },
};

// Replaces the "body" rules we would normally put in a CSS file
export function applyGlobalStyles() {
  document.body.style.margin = "0";
  document.body.style.minHeight = "100vh";
  document.body.style.fontFamily = '"Segoe UI", system-ui, sans-serif';
  document.body.style.color = colors.text;
  document.body.style.background =
    "linear-gradient(135deg, #eef2ff 0%, #e0f2fe 100%)";
}