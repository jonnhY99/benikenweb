// src/index.js
import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./styles.css";
import App from "./App.js";
import { ToastProvider } from "./context/ToastContext.js";
import { AuthProvider } from "./context/AuthContext.js";
import { register } from './utils/serviceWorkerRegistration';

const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  </StrictMode>
);

// Register service worker
register({
  onSuccess: () => {
    console.log('Service Worker registered successfully');
  },
  onUpdate: () => {
    console.log('Service Worker updated');
  }
});
