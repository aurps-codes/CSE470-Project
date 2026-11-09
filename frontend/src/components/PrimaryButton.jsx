import { useState } from "react";
import { styles } from "../styles/theme";

export default function PrimaryButton({ text, type = "submit", disabled = false, onClick }) {
  const [hover, setHover] = useState(false);

  let buttonStyle = { ...styles.primaryButton };
  if (hover && !disabled) {
    buttonStyle = { ...buttonStyle, ...styles.primaryButtonHover };
  }
  if (disabled) {
    buttonStyle = { ...buttonStyle, ...styles.primaryButtonDisabled };
  }

  return (
    <button
      type={type}
      style={buttonStyle}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {text}
    </button>
  );
}