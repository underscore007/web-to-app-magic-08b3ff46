module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2022: true,
  },
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: { jsx: true },
  },
  settings: {
    react: { version: "detect" },
  },
  plugins: ["react", "react-hooks"],
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
  ],
  ignorePatterns: ["dist", "node_modules", "backend/node_modules"],
  rules: {
    // React 17+ JSX transform
    "react/react-in-jsx-scope": "off",

    // This repo uses CSS Modules and placeholder components; treat unused as non-blocking.
    "no-unused-vars": "warn",
    "react/prop-types": "off",
    "react/no-unescaped-entities": "off",
    "no-useless-escape": "warn",
  },
};
