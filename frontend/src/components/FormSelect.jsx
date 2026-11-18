import { styles } from "../styles/theme";

// A dropdown. "options" is a list of strings.
export default function FormSelect({ label, value, onChange, options, placeholder }) {
  return (
    <div style={styles.formGroup}>
      {label && <label style={styles.label}>{label}</label>}
      <select value={value} onChange={onChange} style={styles.select} required>
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
