
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './adventure.css';

function mountApp() {
  const rootElement = document.getElementById('root');

  if (!rootElement) {
    // This case should ideally not be hit if DOMContentLoaded fired,
    // but as a strong safeguard:
    console.error("CRITICAL ERROR: Root element with ID 'root' was not found in the DOM even after DOMContentLoaded.");
    // Optionally, display an error message directly in the body
    document.body.innerHTML = '<div style="color: red; padding: 20px; font-family: sans-serif; text-align: center;"><h1>Application Mount Error</h1><p>Could not find the root HTML element (div with id=\'root\') to attach the application. Please check the HTML file.</p></div>';
    return; // Stop execution if no root element
  }

  // Ensure it's an HTMLElement, which createRoot expects
  if (!(rootElement instanceof HTMLElement)) {
    console.error("CRITICAL ERROR: The element found with ID 'root' is not a valid HTMLElement.");
    document.body.innerHTML = '<div style="color: red; padding: 20px; font-family: sans-serif; text-align: center;"><h1>Application Mount Error</h1><p>The root element found is not a valid HTML element type.</p></div>';
    return;
  }

  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error("CRITICAL ERROR: React failed to mount.", error);
    // Display a generic React error or details from the error object
    let errorMessage = "An unexpected error occurred while starting the React application.";
    if (error instanceof Error) {
        errorMessage += `<br/>Details: ${error.message}`;
    }
     document.body.innerHTML = `<div style="color: red; padding: 20px; font-family: sans-serif; text-align: center;"><h1>Application Mount Error</h1><p>${errorMessage}</p></div>`;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp, { once: true });
} else {
  mountApp();
}
