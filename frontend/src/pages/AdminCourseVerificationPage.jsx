import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import FileLinks from "../components/FileLinks";
import PageLayout from "../components/PageLayout";
import StatusBadge from "../components/StatusBadge";
import * as courseVerificationService from "../services/courseVerificationService";
import { styles } from "../styles/theme";

const TABS = ["pending", "approved", "rejected"];

// One request with Approve / Reject buttons (buttons only show for pending requests)
function RequestCard({ request, onChanged, onError }) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleApprove() {
    setBusy(true);
    try {
      await courseVerificationService.approveRequest(request.id);
      onChanged();
    } catch (err) {
      onError(err.message);
      setBusy(false);
    }
  }

  async function handleReject() {
    setBusy(true);
    try {
      await courseVerificationService.rejectRequest(request.id, reason);
      onChanged();
    } catch (err) {
      onError(err.message);
      setBusy(false);
    }
  }

  return (
    <div style={styles.requestItem}>
      <div style={styles.requestTop}>
        <strong>{request.subject}</strong>
        <StatusBadge status={request.status} />
      </div>
      <p style={{ ...styles.mutedText, margin: "0 0 8px" }}>
        {request.teacher_name} ({request.teacher_email})
      </p>
      <FileLinks request={request} />

      {request.status === "rejected" && (
        <p style={{ ...styles.mutedText, margin: "8px 0 0" }}>Reason: {request.rejection_reason}</p>
      )}

      {request.status === "pending" && !rejecting && (
        <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
          <button
            type="button"
            style={{ ...styles.smallButton, background: "#16a34a" }}
            disabled={busy}
            onClick={handleApprove}
          >
            Approve
          </button>
          <button
            type="button"
            style={{ ...styles.smallButton, background: "#dc2626" }}
            disabled={busy}
            onClick={() => setRejecting(true)}
          >
            Reject
          </button>
        </div>
      )}

      {request.status === "pending" && rejecting && (
        <div style={{ marginTop: "12px" }}>
          <textarea
            style={styles.textarea}
            rows={2}
            maxLength={300}
            placeholder="Why is it rejected? (the teacher will see this)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              style={{ ...styles.smallButton, background: "#dc2626" }}
              disabled={busy || reason.trim().length < 3}
              onClick={handleReject}
            >
              Confirm reject
            </button>
            <button type="button" style={styles.linkButton} onClick={() => setRejecting(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Admin page: look at the teachers' requests and approve or reject them
export default function AdminCourseVerificationPage() {
  const [status, setStatus] = useState("pending");
  const [requests, setRequests] = useState(null); // null means "still loading"
  const [error, setError] = useState("");

  function loadRequests(tab) {
    return courseVerificationService
      .getRequests(tab)
      .then((data) => setRequests(data))
      .catch((err) => setError(err.message));
  }

  useEffect(() => {
    loadRequests(status);
  }, [status]);

  function changeTab(tab) {
    setError("");
    setRequests(null);
    setStatus(tab);
  }

  return (
    <PageLayout>
      <p style={styles.mutedText}>
        <Link to="/dashboard" style={styles.link}>
          &larr; Back to dashboard
        </Link>
      </p>

      <div style={styles.panel}>
        <h2 style={styles.panelTitle}>Review Course Verifications</h2>

        <div style={styles.tabRow}>
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              style={
                tab === status
                  ? { ...styles.roleButton, ...styles.roleButtonActive }
                  : styles.roleButton
              }
              onClick={() => changeTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}
        {requests === null && !error && <p style={styles.mutedText}>Loading...</p>}
        {requests !== null && requests.length === 0 && (
          <p style={styles.mutedText}>No {status} requests.</p>
        )}

        {requests !== null &&
          requests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              onChanged={() => loadRequests(status)}
              onError={setError}
            />
          ))}
      </div>
    </PageLayout>
  );
}
