import { styles } from "../styles/theme";

function formatDate(isoText, timeZone) {
  return new Date(isoText).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: timeZone,
  });
}

// Shows one post. A student's post is a "request", a teacher's post is an "offer".
// onDelete is optional: pass it only when the logged-in user owns the post.
export default function PostCard({ post, onDelete }) {
  const isOffer = post.post_type === "teacher";

  return (
    <div style={styles.requestItem}>
      <div style={styles.requestTop}>
        <strong>{post.title}</strong>
        <span style={{ ...styles.badge, ...(isOffer ? styles.badgeOffer : styles.badgeRequest) }}>
          {isOffer ? "Teacher offer" : "Student request"}
        </span>
      </div>

      <div style={styles.postDetails}>
        <span>
          <strong>Subject:</strong> {post.subject}
        </span>
        <span>
          <strong>Level:</strong> {post.class_level}
        </span>
        <span>
          <strong>Classes:</strong> {post.number_of_classes} ({post.classes_per_week}/week)
        </span>
        <span>
          <strong>Total hours:</strong> {post.total_hours}
        </span>
        <span>
          <strong>{isOffer ? "Fee" : "Budget"}:</strong> &#2547;{post.honorarium.toLocaleString()}
        </span>
        <span>
          <strong>Days:</strong> {post.preferred_days.join(", ")}
        </span>
        <span>
          <strong>Time:</strong> {post.preferred_time}
        </span>
        {post.start_date && (
          <span>
            <strong>Start:</strong> {formatDate(post.start_date, "UTC")}
          </span>
        )}
        {isOffer && (
          <span>
            <strong>Qualification:</strong> {post.qualification} ({post.experience_years} yrs
            experience)
          </span>
        )}
      </div>

      {post.description && <p style={styles.postDescription}>{post.description}</p>}

      <div style={styles.postFooter}>
        <span>
          By {post.author_name} &middot; {formatDate(post.created_at)}
        </span>
        {onDelete && (
          <button
            type="button"
            style={{ ...styles.smallButton, ...styles.dangerButton }}
            onClick={() => onDelete(post)}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
