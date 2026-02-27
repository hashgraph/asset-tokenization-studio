import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";

/** React/browser environment overlay */
export default {
  files: ["**/*.{ts,tsx,js,jsx}"],
  languageOptions: {
    globals: {
      ...globals.browser,
      ...globals.node,
    },
    parserOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
  plugins: {
    "react-hooks": reactHooks,
    "react-refresh": reactRefresh,
  },
  settings: {
    react: {
      version: "detect",
    },
  },
  rules: {
    ...reactHooks.configs.recommended.rules,
    "react-refresh/only-export-components": "off",
  },
};
