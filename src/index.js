import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import OfflineBanner from "./components/shared/OfflineBanner";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <OfflineBanner />
    <App />
  </React.StrictMode>,
);

// Activar Service Worker para soporte offline y caché de flashcards
serviceWorkerRegistration.register({
  onUpdate: (registration) => {
    // Notificar al SW que active la nueva versión al recargar
    if (registration.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
    }
  },
});

reportWebVitals();
