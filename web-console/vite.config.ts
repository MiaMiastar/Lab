import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/Lab/",
  plugins: [react()],
  server: { port: 5173, open: "/Lab/" },
  build: {
    outDir: "../docs",
    emptyOutDir: false,
  },
});
