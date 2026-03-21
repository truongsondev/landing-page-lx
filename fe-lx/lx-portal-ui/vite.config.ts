import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

const usePolling = process.env.CHOKIDAR_USEPOLLING === "true";
const pollingInterval = Number(process.env.CHOKIDAR_INTERVAL || "300");

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    watch: {
      usePolling,
      interval: pollingInterval,
    },
    hmr: {
      clientPort: 5173,
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
