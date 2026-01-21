// vite.config.js (NOT .ts)
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    host: true, // Add this to ensure it's accessible
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  base: "/",
});
