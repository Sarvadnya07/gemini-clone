import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import ContextProvider from "./context/context.jsx";

// Ensures root element exists — avoids silent crashes in production
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("❌ Root element #root not found in index.html");
}

createRoot(rootElement).render(
  <StrictMode>
    <ContextProvider>
      <App />
    </ContextProvider>
  </StrictMode>
);
