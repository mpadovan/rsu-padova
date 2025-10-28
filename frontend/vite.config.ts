import { defineConfig } from "vite";
import { vitePlugin as remix } from "@remix-run/vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react(), remix()],
  server: {
    port: 5173
  },
  define: {
    "process.env": {}
  }
});
