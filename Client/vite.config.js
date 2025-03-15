import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Fix for Draft.js
    global: 'window',
    // Needed for some npm packages that use process.env
    'process.env': {}
  },
});
