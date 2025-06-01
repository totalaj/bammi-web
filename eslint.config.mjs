/** eslint-disable */
import stylistic from '@stylistic/eslint-plugin'
import pluginJs from "@eslint/js"
import tseslint from "typescript-eslint"

/** @type {import('eslint').Linter.Config[]} */
export default [
  { 
    files: ["**/*.{js,ts}"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      '@stylistic': stylistic
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  { rules: {
      "semi": ["warn", "never"],
      "constructor-super": "error",
      "getter-return": "error",
      "no-const-assign": "error",
      "no-irregular-whitespace": "error",
      "no-unused-vars": "warn",
      "default-case": "error",
      "default-case-last": "error",
      "eqeqeq": "error",
      "no-empty": "error",
      "no-empty-function": ["warn", { "allow": ["constructors"]}],
      "no-shadow": "warn",
      "no-var": "error",
      "prefer-const": "error",
      "consistent-return": "warn",
      "no-useless-constructor": "off",
      "@typescript-eslint/explicit-function-return-type": "error",
      "@typescript-eslint/consistent-type-exports": "warn",
      "@typescript-eslint/dot-notation": "warn",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-function": "warn",
      "@typescript-eslint/explicit-member-accessibility": ["warn", { "overrides": {"constructors": "no-public"}}],
      "@typescript-eslint/naming-convention": ["warn",
      {
        "selector": "default",
        "format": ["snake_case"]
      },
      {
        "selector": "import",
        "format": ["PascalCase"]
      },
      {
        "selector": ["property", "parameterProperty"],
        "modifiers": ["private"],
        "format": ["snake_case"],
        "leadingUnderscore": "require"
      },
      {
        "selector": "variable",
        "modifiers": ["global"],
        "format": ["UPPER_CASE"]
      },
      {
        "selector": "enumMember",
        "format": ["UPPER_CASE"]
      },
      {
        "selector": ["class", "typeLike"],
        "format": ["PascalCase"]
      },
      {
        "selector": ["classProperty"],
        "modifiers": ["readonly"],
        "format": ["UPPER_CASE"],
      }
      ],
      "@typescript-eslint/no-unused-vars": "off",
      "@stylistic/indent": ["warn", 4],
      "@stylistic/nonblock-statement-body-position": ["warn", "beside"],
      "@stylistic/padded-blocks": ["warn", "never"],
      "@stylistic/no-multi-spaces": "warn",
      "@stylistic/no-multiple-empty-lines": "warn",
      "@stylistic/no-trailing-spaces": "warn",
      "@stylistic/no-whitespace-before-property": "warn",
      "@stylistic/type-annotation-spacing": "warn",
      "@stylistic/type-generic-spacing": "warn",
      "@stylistic/operator-linebreak": ["warn", "before"],
      "@stylistic/space-infix-ops": "warn",
      "@stylistic/space-unary-ops": "warn",
      "@stylistic/comma-dangle": ["warn", "never"],
      "@stylistic/comma-spacing": "warn",
      "@stylistic/comma-style": ["warn", "last"],
      "@stylistic/array-bracket-newline": ["warn", "consistent"],
      "@stylistic/array-bracket-spacing": ["warn", "always"],
      "@stylistic/brace-style": ["warn", "stroustrup", { "allowSingleLine": true }],
      "@stylistic/curly-newline": ["warn", { "consistent": true }],
      "@stylistic/function-paren-newline": ["warn", "multiline"],
      "@stylistic/new-parens": "warn",
      "@stylistic/object-curly-newline": ["warn", { "multiline": true }],
      "@stylistic/object-curly-spacing": ["warn", "always"],
      "@stylistic/space-before-function-paren": ["warn", "never"],
      "@stylistic/space-in-parens": ["warn", "never"],
      "@stylistic/template-curly-spacing": "warn",
      "@stylistic/arrow-spacing": "warn",
      "@stylistic/block-spacing": "warn",
      "@stylistic/function-call-spacing": "warn",
      "@stylistic/key-spacing": "warn",
      "@stylistic/keyword-spacing": "warn",
      "@stylistic/no-mixed-spaces-and-tabs": "warn",
      "@stylistic/space-before-blocks": "warn",
      "@stylistic/switch-colon-spacing": "warn",
      "@stylistic/spaced-comment": ["warn", "always"]
    }
  }
]
