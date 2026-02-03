// eslint-disable-next-line no-undef
module.exports = {
  env: {
    browser: false,
    node: true,
    es2021: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "airbnb-base",
    "airbnb-typescript/base",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    project: "./tsconfig.json",
  },
  plugins: ["@typescript-eslint"],
  rules: {
    // for coding styles
    indent: ["error", 2, { SwitchCase: 1 }],
    quotes: ["error", "single"],
    "max-len": ["error", { code: 150 }],
    semi: ["error", "always"],
    "no-console": "warn",
    "comma-spacing": "error",

    // for variables and constants
    "no-unused-vars": "error",
    "no-undef": "error",
    "no-redeclare": "error",

    // functions/arrow functions
    "func-style": ["error", "declaration", { allowArrowFunctions: true }],
    "prefer-arrow-callback": "error",
    "arrow-parens": [2, "as-needed", { requireForBlockBody: true }],

    // for modules and imports
    "import/no-unresolved": "error",
    "import/order": [
      "error",
      {
        groups: [
          "builtin",
          "external",
          "internal",
          ["parent", "sibling", "index"],
        ],
        "newlines-between": "always",
      },
    ],
    "import/no-extraneous-dependencies": ["error", { devDependencies: true }],

    // for functions
    "arrow-spacing": "error",
    "no-return-await": "error",

    // for error handling
    "no-throw-literal": "error",
    "prefer-promise-reject-errors": "error",

    // for callbacks and promises
    "promise/always-return": "off",
    "callback-return": "off",

    // for async/await
    "require-await": "error",

    "class-methods-use-this": "off",
    "max-classes-per-file": "off",
    "import/no-relative-packages": "off",
    "prefer-destructuring": "warn",
    "import/no-import-module-exports": "warn",
    "no-restricted-syntax": "warn",
    "no-underscore-dangle": "warn",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/naming-convention": "warn",
    "@typescript-eslint/dot-notation": "warn",
    "no-plusplus": ["error", { allowForLoopAfterthoughts: true }],
    // eslint-disable-next-line no-dupe-keys
    "@typescript-eslint/naming-convention": [
      "error",
      {
        selector: "variableLike",
        format: ["camelCase", "PascalCase", "snake_case", "UPPER_CASE"],
        leadingUnderscore: "allow",
        trailingUnderscore: "allow",
      },
    ],
    // eslint-disable-next-line no-dupe-keys
    "no-underscore-dangle": ["error", { allow: ["_id"] }],
  },
};
