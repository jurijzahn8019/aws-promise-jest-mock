module.exports = {
  plugins: ["import"],
  extends: [
    "airbnb-base",
    "plugin:jest/recommended",
    "plugin:prettier/recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  settings: {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"],
    },
    "import/resolver": {
      typescript: {},
    },
  },
  overrides: [
    {
      files: ["*.js"],
      rules: {
        "@typescript-eslint/no-var-requires": "off",
      },
    },
    {
      files: ["*.ts"],
      rules: {
        "import/extensions": [
          "error",
          "ignorePackages",
          {
            ts: "never",
            tsx: "never",
            js: "never",
            jsx: "never",
            mjs: "never",
          },
        ],
        // ? This conflicts with 'import/no-named-as-default'
        "import/prefer-default-export": "off",
        // ? Do not apply rule to arrow functions without name
        "@typescript-eslint/explicit-function-return-type": [
          "warn",
          { allowExpressions: true },
        ],
        "no-nested-ternary": "off",
        "no-use-before-define": "off",
        "@typescript-eslint/no-use-before-define": "off",
        "@typescript-eslint/no-parameter-properties": "off",
      },
    },
  ],
};
