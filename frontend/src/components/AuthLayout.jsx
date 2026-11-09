import { styles } from "../styles/theme";

export default function AuthLayout({ subtitle, children }) {
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.brand}>TutorNest</div>
        <p style={styles.subtitle}>{subtitle}</p>
        {children}
      </div>
    </div>
  );
}