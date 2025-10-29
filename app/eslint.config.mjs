import { defineConfig, globalIgnores } from 'eslint/config';
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

const config = defineConfig([
  ...nextCoreWebVitals,
  ...nextTypescript,
  globalIgnores(['.next/**', 'out/**', 'build/**']),
]);

export default config;
