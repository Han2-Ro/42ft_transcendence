import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    "*/.next/**",
    "*/out/**",
    "*/build/**",
    "*/dist/**",
    "*/next-env.d.ts",
  ]),
  {
    settings: {
      react: {
        version: "999.999.999",
      },
    },
    rules: {
      semi: ["error", "always"],
      "@next/next/no-html-link-for-pages": "off",
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: ["function", "method"],
          format: ["camelCase"],
          leadingUnderscore: "allow",
        },
        {
          selector: "variable",
          format: ["camelCase", "UPPER_CASE"],
          leadingUnderscore: "allow",
        },
        {
          selector: ["typeLike"],
          format: ["PascalCase"],
        },
      ],
    },
  },
  {
    files: ["nextjs/**/*"],
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "@next/next/no-html-link-for-pages": ["error", "nextjs/src/app"],
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "function",
          format: ["PascalCase", "camelCase"],
        },
        {
          selector: "method",
          format: ["camelCase"],
          leadingUnderscore: "allow",
        },
        {
          selector: "variable",
          format: ["camelCase", "PascalCase", "UPPER_CASE"],
          leadingUnderscore: "allow",
        },
        {
          selector: ["typeLike"],
          format: ["PascalCase"],
        },
      ],
    },
  },
]);

export default eslintConfig;
