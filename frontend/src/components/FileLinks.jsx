import { useState } from "react";
import * as courseVerificationService from "../services/courseVerificationService";
import { styles } from "../styles/theme";

// Shows the uploaded documents of one request. Clicking a name opens it in a new tab.
export default function FileLinks({ request }) {
  const [error, setError] = useState("");

  async function handleOpen(file) {
    setError("");
    try {
      await courseVerificationService.openVerificationFile(request.id, file.stored_name);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      {request.files.map((file) => (
        <button
          key={file.stored_name}
          type="button"
          style={styles.fileLink}
          onClick={() => handleOpen(file)}
        >
          {file.original_name}
        </button>
      ))}
      {error && <div style={{ ...styles.errorBox, marginTop: "8px" }}>{error}</div>}
    </div>
  );
}
