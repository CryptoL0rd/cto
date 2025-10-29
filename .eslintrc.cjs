module.exports = {
  root: true,
  extends: ["next/core-web-vitals", "next/typescript"],
  settings: {
    next: {
      rootDir: ["./"],
    },
  },
  rules: {
    "@next/next/no-html-link-for-pages": "off",
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
  },
  ignorePatterns: ["*.config.mjs", "*.config.js", "*.config.cjs"],
};
