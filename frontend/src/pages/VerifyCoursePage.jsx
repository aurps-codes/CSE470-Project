import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import FileLinks from "../components/FileLinks";
import FormInput from "../components/FormInput";
import PageLayout from "../components/PageLayout";
import PrimaryButton from "../components/PrimaryButton";
import StatusBadge from "../components/StatusBadge";
import * as courseVerificationService from "../services/courseVerificationService";
import { styles } from "../styles/theme";

// Teacher page: send a course (subject) for verification and see the result
export default function VerifyCoursePage() {
  const [requests, setRequests] = useState([]);
  const [verifiedSubjects, setVerifiedSubjects] = useState([]);
  const [subject, setSubject] = useState("");
  const [files, setFiles] = useState([]);
  const [fileInputKey, setFileInputKey] = useState(0); // changing the key clears the file input
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function loadData() {
    return Promise.all([
      courseVerificationService.getMyRequests(),
      courseVerificationService.getVerifiedSubjects(),
    ])
      .then(([myRequests, verified]) => {
        setRequests(myRequests);
        setVerifiedSubjects(verified.subjects);
      })
      .catch((err) => setError(err.message));
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (files.length === 0) {
      setError("Please choose at least one document (PDF or image).");
      return;
    }

    setLoading(true);
    try {
      await courseVerificationService.submitRequest(subject, files);
      setMessage("Request sent. The admin will review it soon.");
      setSubject("");
      setFiles([]);
      setFileInputKey(fileInputKey + 1);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  return (
    <PageLayout>
      <p style={styles.mutedText}>
        <Link to="/dashboard" style={styles.link}>
          &larr; Back to dashboard
        </Link>
      </p>

      <div style={styles.panel}>
        <h2 style={styles.panelTitle}>Verify a Course</h2>
        <p style={styles.mutedText}>
          Enter a subject you teach and upload proof (certificate, ID, result sheet). Allowed:
          PDF, PNG, JPG, up to 5 files, 5 MB each.
        </p>

        <form onSubmit={handleSubmit}>
          {error && <div style={styles.errorBox}>{error}</div>}
          {message && <div style={styles.successBox}>{message}</div>}

          <FormInput
            label="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Higher Math"
            maxLength={60}
          />

          <div style={styles.formGroup}>
            <label style={styles.label}>Documents</label>
            <input
              key={fileInputKey}
              type="file"
              multiple
              accept=".pdf,.png,.jpg,.jpeg"
              style={styles.fileInput}
              onChange={(e) => setFiles(Array.from(e.target.files))}
            />
          </div>

          <PrimaryButton
            text={loading ? "Sending..." : "Send for verification"}
            disabled={loading}
          />
        </form>
      </div>

      <div style={styles.panel}>
        <h2 style={styles.panelTitle}>My verified courses</h2>
        {verifiedSubjects.length === 0 ? (
          <p style={styles.mutedText}>No verified courses yet.</p>
        ) : (
          <p style={{ margin: 0 }}>{verifiedSubjects.join(", ")}</p>
        )}
      </div>

      <div style={styles.panel}>
        <h2 style={styles.panelTitle}>My requests</h2>
        {requests.length === 0 && <p style={styles.mutedText}>You have not sent any request yet.</p>}

        {requests.map((request) => (
          <div key={request.id} style={styles.requestItem}>
            <div style={styles.requestTop}>
              <strong>{request.subject}</strong>
              <StatusBadge status={request.status} />
            </div>
            <FileLinks request={request} />
            {request.status === "rejected" && (
              <p style={{ ...styles.mutedText, margin: "8px 0 0" }}>
                Reason: {request.rejection_reason}
              </p>
            )}
          </div>
        ))}
      </div>
    </PageLayout>
  );
}
