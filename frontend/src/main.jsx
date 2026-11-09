import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { applyGlobalStyles } from "./styles/theme";

applyGlobalStyles();
document.title = "TutorNest";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);