import { styles } from "../styles/theme";

const badgeStyles = {
  pending: styles.badgePending,
  approved: styles.badgeApproved,
  rejected: styles.badgeRejected,
};

export default function StatusBadge({ status }) {
  return <span style={{ ...styles.badge, ...badgeStyles[status] }}>{status}</span>;
}
