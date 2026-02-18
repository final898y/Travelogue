import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import { defineConfig } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier/flat";

export default defineConfig([
  // 1. 全域排除設定 (Global Ignores)
  {
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      "**/public/**",
      "**/temp/**",
      "**/*.config.js",
    ],
  },

  // 2. 基礎 JS/TS/Vue 檔案配置
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,vue}"],
    plugins: { js },
    extends: [js.configs.recommended],
    languageOptions: { globals: globals.browser },
  },

  // 3. 繼承 TypeScript 與 Vue 的推薦設定
  ...tseslint.configs.recommended,
  ...pluginVue.configs["flat/essential"],

  // 4. Vue 檔案的 Parser 設定
  {
    files: ["**/*.vue"],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },

  // 5. 特定路徑與規則調整
  {
    files: ["tests/**/*.{ts,js}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
  eslintConfigPrettier,
]);
