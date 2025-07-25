import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Minimal error suppression for development cross-origin issues only
window.addEventListener('error', (event) => {
  if (event.message === 'Script error.') {
    event.preventDefault();
    return false;
  }
}, true);

createRoot(document.getElementById("root")!).render(<App />);
