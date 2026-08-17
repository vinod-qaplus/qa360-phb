import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import path from "path"; // Import path to resolve directories

// https://vite.dev/config/
export default defineConfig({
  logLevel: "error",

  server: {
    port: 5174,
    strictPort: false,
  },

  resolve: {
    alias: {
      // This maps "@" to your "src" directory
      "@": path.resolve(__dirname, "./src"),
    },
  },

  plugins: [react()],
  // base: "/Scripts/PHB-App/", //for iChord
});
