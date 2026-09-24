import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // This codebase deliberately hydrates client state from
      // localStorage in a useEffect (so the server render and the first
      // client render both start from the same default, avoiding a
      // hydration mismatch) and fetches data in effects the standard
      // way. Both are exactly what this rule (aimed at React Compiler
      // codebases) flags as an error; downgrading to a warning keeps the
      // signal without failing CI on correct, intentional code.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Native projects contain generated/copied build output, not source.
    "android/**",
    "ios/**",
  ]),
]);

export default eslintConfig;
