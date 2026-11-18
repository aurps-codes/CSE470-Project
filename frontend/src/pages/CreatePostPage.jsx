import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FormInput from "../components/FormInput";
import FormSelect from "../components/FormSelect";
import PageLayout from "../components/PageLayout";
import PrimaryButton from "../components/PrimaryButton";
import { useAuth } from "../context/AuthContext";
import * as courseVerificationService from "../services/courseVerificationService";
import * as postService from "../services/postService";
import { styles } from "../styles/theme";

const EMPTY_FORM = {
  title: "",
  subject: "",
  class_level: "",
  number_of_classes: "",
  classes_per_week: "",
  total_hours: "",
  honorarium: "",
  preferred_time: "",
  start_date: "",
  description: "",
  qualification: "",
  experience_years: "",
};

// Students post a tuition request, teachers post a tuition offer.
// The form is almost the same; teachers also give qualification and experience,
// and can pick only the subjects the admin has verified for them.
export default function CreatePostPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isTeacher = user.role === "teacher";

  const [form, setForm] = useState(EMPTY_FORM);
  const [days, setDays] = useState([]);
  const [options, setOptions] = useState(null); // dropdown choices from the server
  const [verifiedSubjects, setVerifiedSubjects] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const requests = [postService.getOptions()];
    if (isTeacher) {
      requests.push(courseVerificationService.getVerifiedSubjects());
    }

    Promise.all(requests)
      .then(([optionData, verified]) => {
        setOptions(optionData);
        if (verified) {
          setVerifiedSubjects(verified.subjects);
        }
      })
      .catch((err) => setError(err.message));
  }, [isTeacher]);

  function setField(name) {
    return (event) => setForm({ ...form, [name]: event.target.value });
  }

  function toggleDay(day) {
    // Using the "current" value keeps the list right even if two clicks come very quickly
    setDays((current) =>
      current.includes(day) ? current.filter((item) => item !== day) : [...current, day]
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (days.length === 0) {
      setError("Please choose at least one preferred day.");
      return;
    }

    const data = {
      title: form.title,
      subject: form.subject,
      class_level: form.class_level,
      number_of_classes: Number(form.number_of_classes),
      classes_per_week: Number(form.classes_per_week),
      total_hours: Number(form.total_hours),
      honorarium: Number(form.honorarium),
      preferred_days: days,
      preferred_time: form.preferred_time,
      start_date: form.start_date || null,
      description: form.description.trim() || null,
    };
    if (isTeacher) {
      data.qualification = form.qualification;
      data.experience_years = Number(form.experience_years);
    }

    setLoading(true);
    try {
      await postService.createPost(data);
      navigate("/my-posts");
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  // Today's date (yyyy-mm-dd) so the date picker does not allow the past
  const today = new Date().toISOString().slice(0, 10);
  const noVerifiedSubject = isTeacher && options !== null && verifiedSubjects.length === 0;

  return (
    <PageLayout>
      <p style={styles.mutedText}>
        <Link to="/dashboard" style={styles.link}>
          &larr; Back to dashboard
        </Link>
      </p>

      <div style={styles.panel}>
        <h2 style={styles.panelTitle}>
          {isTeacher ? "Create a Teaching Offer" : "Create a Tuition Request"}
        </h2>

        {error && <div style={styles.errorBox}>{error}</div>}
        {options === null && !error && <p style={styles.mutedText}>Loading...</p>}

        {noVerifiedSubject && (
          <p style={styles.mutedText}>
            You can only post subjects you are verified to teach, and you have none yet.{" "}
            <Link to="/verify-course" style={styles.link}>
              Verify a course
            </Link>{" "}
            first.
          </p>
        )}

        {options !== null && !noVerifiedSubject && (
          <form onSubmit={handleSubmit}>
            <FormInput
              label="Title"
              value={form.title}
              onChange={setField("title")}
              placeholder={
                isTeacher ? "e.g. Higher Math for SSC and HSC" : "e.g. Need a Physics tutor for HSC"
              }
              maxLength={100}
            />

            <div style={styles.formGrid}>
              {isTeacher ? (
                <FormSelect
                  label="Subject (verified)"
                  value={form.subject}
                  onChange={setField("subject")}
                  options={verifiedSubjects}
                  placeholder="Choose a subject"
                />
              ) : (
                <FormInput
                  label="Subject"
                  value={form.subject}
                  onChange={setField("subject")}
                  placeholder="e.g. Physics"
                  maxLength={60}
                />
              )}

              <FormSelect
                label={isTeacher ? "Level you will teach" : "Your class level"}
                value={form.class_level}
                onChange={setField("class_level")}
                options={options.class_levels}
                placeholder="Choose a level"
              />

              <FormInput
                label="Number of classes (total)"
                type="number"
                min="1"
                max="500"
                value={form.number_of_classes}
                onChange={setField("number_of_classes")}
              />

              <FormInput
                label="Classes per week"
                type="number"
                min="1"
                max="7"
                value={form.classes_per_week}
                onChange={setField("classes_per_week")}
              />

              <FormInput
                label="Total hours (all classes)"
                type="number"
                min="0.25"
                max="2000"
                step="any"
                value={form.total_hours}
                onChange={setField("total_hours")}
              />

              <FormInput
                label="Honorarium (BDT, total)"
                type="number"
                min="1"
                max="1000000"
                value={form.honorarium}
                onChange={setField("honorarium")}
              />

              <FormSelect
                label="Preferred time"
                value={form.preferred_time}
                onChange={setField("preferred_time")}
                options={options.time_slots}
                placeholder="Choose a time"
              />

              <FormInput
                label="Start date (optional)"
                type="date"
                min={today}
                required={false}
                value={form.start_date}
                onChange={setField("start_date")}
              />

              {isTeacher && (
                <>
                  <FormInput
                    label="Qualification"
                    value={form.qualification}
                    onChange={setField("qualification")}
                    placeholder="e.g. BSc in Mathematics"
                    maxLength={100}
                  />
                  <FormInput
                    label="Years of experience"
                    type="number"
                    min="0"
                    max="60"
                    value={form.experience_years}
                    onChange={setField("experience_years")}
                  />
                </>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Preferred days</label>
              <div style={styles.dayRow}>
                {options.days.map((day) => (
                  <button
                    key={day}
                    type="button"
                    style={{
                      ...styles.dayButton,
                      ...(days.includes(day) ? styles.dayButtonActive : {}),
                    }}
                    onClick={() => toggleDay(day)}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Description (optional)</label>
              <textarea
                style={{ ...styles.textarea, marginBottom: 0 }}
                rows={4}
                maxLength={1000}
                value={form.description}
                onChange={setField("description")}
                placeholder="Anything else people should know"
              />
            </div>

            <PrimaryButton text={loading ? "Posting..." : "Post"} disabled={loading} />
          </form>
        )}
      </div>
    </PageLayout>
  );
}
