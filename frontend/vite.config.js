import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],

  optimizeDeps: {
    include: ["react-router-dom"],
  },

  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),

        main: resolve(__dirname, "main.html"),
      },
    },
  },

  server: {
    allowedHosts: ["localhost", "76ca-79-127-249-67.ngrok-free.app"],
  },
});
