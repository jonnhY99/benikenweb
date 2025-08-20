// src/index.js
import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./styles.css";
import App from "./App.js";
import { ToastProvider } from "./context/ToastContext.js"; // 👈 Importar

const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <ToastProvider> {/* 👈 Envolver toda la app */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ToastProvider>
  </StrictMode>
);
