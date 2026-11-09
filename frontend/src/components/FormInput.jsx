import { useState } from "react";
import { styles } from "../styles/theme";

export default function FormInput({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  extraStyle,
  maxLength,
  inputMode,
}) {
  const [focused, setFocused] = useState(false);

  let inputStyle = { ...styles.input, ...extraStyle };
  if (focused) {
    inputStyle = { ...inputStyle, ...styles.inputFocused };
  }

  return (
    <div style={styles.formGroup}>
      {label && <label style={styles.label}>{label}</label>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        inputMode={inputMode}
        style={inputStyle}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required
      />
    </div>
  );
}