import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Al pasar globalIgnores se pierden los de eslint-config-next, así que los repito
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Código generado de los contratos (npm run generate)
    "lib/gen/**",
    // pdf-lib copiado tal cual para el worker del informe (npm run vendor)
    "public/vendor/**",
  ]),
]);

export default eslintConfig;
