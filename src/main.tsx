import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import { RoleProvider } from "./auth/RoleContext";
import { bootstrap } from "./data/store";
import "./styles/global.css";

// Load from Supabase (if configured) before/while the app renders.
void bootstrap();

// HashRouter keeps client routing working on GitHub Pages without a server
// rewrite / 404.html trick.
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HashRouter>
      <RoleProvider>
        <App />
      </RoleProvider>
    </HashRouter>
  </React.StrictMode>,
);
