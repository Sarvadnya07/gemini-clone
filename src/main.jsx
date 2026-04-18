import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import ContextProvider from "./context/context.jsx";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary.jsx";

// Lazy-load App for faster initial paint
const App = lazy(() => import("./App.jsx"));

// Ensures root element exists — avoids silent crashes in production
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("❌ Root element #root not found in index.html");
}

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <ContextProvider>
        <Suspense
          fallback={
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100vh",
                background: "#131314",
                color: "#9aa0a6",
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.9rem",
                gap: "12px",
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#4285f4"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ animation: "spin 1s linear infinite" }}
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Loading Gemini…
            </div>
          }
        >
          <App />
        </Suspense>
      </ContextProvider>
    </ErrorBoundary>
  </StrictMode>
);
