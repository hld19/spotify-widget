import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync } from 'fs';

const host = process.env.TAURI_DEV_HOST;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


export default defineConfig(({
  plugins: [react()],

  clearScreen: false,

  server: {
    port: 3000,
    strictPort: true,
    host: host || "127.0.0.1",
    cors: true,
    hmr: host ? { protocol: "ws", host, port: 3001 } : undefined,
    watch: {
     
      ignored: ["**/src-tauri/**"],
    },
  },
  build: {
    target: "chrome105",
    minify: "esbuild",
    sourcemap: false,
  },
}));
