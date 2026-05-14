import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import jsxA11y from "eslint-plugin-jsx-a11y";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "jsx-a11y": jsxA11y,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": ["warn", {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "caughtErrorsIgnorePattern": "^_"
      }],
      // Разрешаем spread props для UI-компонентов (shadcn/ui паттерн)
      "jsx-a11y/anchor-has-content": "error",
    },
  },
  // Отключаем строгие правила для тестовых файлов
  {
    files: ["**/*.test.{ts,tsx}", "**/__mocks__/**/*.{ts,tsx}", "**/test/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "react-hooks/rules-of-hooks": "off",
      "no-case-declarations": "off",
      "no-useless-escape": "off",
      "@typescript-eslint/no-require-imports": "off",
      "no-prototype-builtins": "off",
      "@typescript-eslint/no-unsafe-function-type": "off",
    },
  },
);
