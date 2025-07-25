import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Global error handler to suppress cross-origin React errors in development
window.addEventListener('error', (event) => {
  if (event.message === 'Script error.' || 
      event.message.includes('cross-origin error was thrown')) {
    // Prevent these errors from being logged to console
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
}, true);

// Also handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && event.reason.message) {
    if (event.reason.message.includes('cross-origin') || 
        event.reason.message === 'Script error.') {
      event.preventDefault();
      return false;
    }
  }
});

createRoot(document.getElementById("root")!).render(<App />);
