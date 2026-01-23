/**
 * ESLint configuration for ATS Web App
 * Extends root monorepo configuration with React/Web-specific rules
 */
import baseConfig from "../../../eslint.config.mjs";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";

// Filter base config to get general rules and adapt paths for web app
const webConfig = baseConfig
  .filter(
    (config) =>
      // Include base ignores, default config, but exclude package-specific rules
      !config.files || config.files.includes("**/*.{js,mjs,cjs,ts,tsx,mts}"),
  )
  .concat([
    // React/Web app files - adapted paths
    {
      files: ["**/*.{ts,tsx,js,jsx}"],
      languageOptions: {
        globals: {
          ...globals.browser,
          ...globals.node,
          ...globals.jest,
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
        "@typescript-eslint/ban-ts-comment": "off",
        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/no-non-null-asserted-optional-chain": "off",
        "@typescript-eslint/no-empty-function": "off",
      },
    },
  ]);

export default webConfig;
