import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages serves under https://<user>.github.io/<repo>/.
// Set base to "/<repo>/" for project pages. Override via VITE_BASE if the
// repo name differs, or set "/" for a user/custom-domain page.
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE ?? "/valour/",
});
