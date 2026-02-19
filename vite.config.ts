/// <reference types="vitest" />
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vitest/config";
import { configDefaults } from "vitest/config";
import { visualizer } from "rollup-plugin-visualizer";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    visualizer({ open: false, filename: "bundle-stats.html" }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-firebase": [
            "firebase/app",
            "firebase/auth",
            "firebase/firestore",
          ],
          "vendor-zod": ["zod"],
          "vendor-vue": ["vue", "vue-router", "pinia"],
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    exclude: [...configDefaults.exclude, "e2e/**"],
  },
});
