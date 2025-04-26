import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import reactRecommended from "eslint-plugin-react/configs/recommended.js";
import reactHooks from "eslint-plugin-react-hooks";
import nextjs from "@next/eslint-plugin-next";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Core ESLint recommended rules
  js.configs.recommended,
  
  // TypeScript support
  {
    files: ["**/*.ts", "**/*.tsx"],
    ...typescriptEslint.configs.recommended,
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    }
  },
  
  // React support
  {
    ...reactRecommended,
    rules: {
      ...reactRecommended.rules,
      "react/no-unescaped-entities": "off",
      "react/react-in-jsx-scope": "off", // Not needed in React 17+
      "react/prop-types": "off", // Not needed with TypeScript
    }
  },
  
  // React Hooks
  {
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn"
    }
  },
  
  // Next.js specific rules
  {
    plugins: {
      "@next/next": nextjs,
    },
    rules: {
      "@next/next/no-html-link-for-pages": "error",
      "@next/next/no-img-element": "warn",
    }
  },
  
  // Your existing compat config
  ...compat.extends("next/core-web-vitals"),
  
  // Project-specific overrides
  {
    ignores: [
      "**/node_modules/",
      "**/.next/",
      "**/out/",
      "**/dist/",
      "**/build/",
    ]
  }
];

export default eslintConfig;