import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { quasar, transformAssetUrls } from "@quasar/vite-plugin";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;

// Resolve __dirname for ESM (vite.config.ts loads as ESM)
const __dirname = resolve(fileURLToPath(new URL(".", import.meta.url)));

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [
    vue({ template: { transformAssetUrls } }),
    // Absolute path — relative paths break when sass is invoked from deep
    // inside node_modules/.pnpm/quasar/.../index.sass
    quasar({ sassVariables: resolve(__dirname, "src/styles/quasar-variables.sass") }),
  ],
  resolve: {
    alias: { "@": resolve(__dirname, "src") },
  },
  // Tauri needs the dev server to be reachable from the device
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? { protocol: "ws", host, port: 1421 }
      : undefined,
    watch: { ignored: ["**/src-tauri/**"] },
  },
}));
