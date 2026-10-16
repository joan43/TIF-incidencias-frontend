import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Configuración portable: el frontend no depende de plugins internos de Figma.
export default defineConfig({
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
  },
  preview: {
    host: "127.0.0.1",
    port: 4173,
    strictPort: true,
  },
});