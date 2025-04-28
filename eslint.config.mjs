import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: ["@/test/*"],
        },
      ],
      "import/no-extraneous-dependencies": [
        "error",
        { devDependencies: false },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error", // or "error"
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    files: [
      "**/src/test/**",
      "**/*.test.ts",
      "*.mjs",
      "**/cypress/**",
      "cypress.config.ts",
    ],
    rules: {
      "no-restricted-imports": "off",
      "import/no-extraneous-dependencies": ["error", { devDependencies: true }],
    },
  },
];

export default eslintConfig;
