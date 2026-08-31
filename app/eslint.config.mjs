import eslint from '@eslint/js';
import globals from 'globals';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

const sourceRules = {
  '@typescript-eslint/naming-convention': [
    'error',
    { selector: 'default', format: ['camelCase'] },
    { selector: 'variable', format: ['camelCase', 'PascalCase', 'UPPER_CASE'] },
    { selector: 'function', format: ['camelCase', 'PascalCase'] },
    { selector: 'parameter', format: ['camelCase', 'PascalCase'], leadingUnderscore: 'allow' },
    { selector: 'typeLike', format: ['PascalCase'] },
    { selector: 'property', format: null },
  ],
  '@typescript-eslint/no-explicit-any': 'error',
  '@typescript-eslint/no-floating-promises': 'error',
  '@typescript-eslint/only-throw-error': 'error',
  complexity: ['error', 10],
  'max-depth': ['error', 4],
  'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }],
  'max-lines-per-function': ['error', { max: 30, skipBlankLines: true, skipComments: true }],
  'max-nested-callbacks': ['error', 3],
  'max-params': ['error', 4],
  'no-console': ['error', { allow: ['warn', 'error'] }],
  'no-empty': ['error', { allowEmptyCatch: false }],
  'no-magic-numbers': ['error', { enforceConst: true, ignore: [-1, 0, 1, 2, 32, 3000, 480] }],
};

export default tseslint.config(
  { ignores: ['**/dist/**', '**/coverage/**', '**/node_modules/**', '**/playwright-report/**'] },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: sourceRules,
  },
  {
    files: ['apps/admin/src/**/*.tsx'],
    plugins: { 'jsx-a11y': jsxA11y, react, 'react-hooks': reactHooks },
    rules: {
      ...jsxA11y.flatConfigs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'no-restricted-syntax': [
        'error',
        {
          message: 'Use design-system utilities instead of inline styles.',
          selector: "JSXAttribute[name.name='style']",
        },
      ],
      'react/jsx-no-useless-fragment': 'error',
      'react/no-multi-comp': ['error', { ignoreStateless: false }],
    },
    settings: { react: { version: 'detect' } },
  },
  {
    files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}', '**/*.config.{ts,js,mjs}'],
    rules: {
      '@typescript-eslint/no-magic-numbers': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      'max-lines-per-function': 'off',
      'max-nested-callbacks': 'off',
      'no-magic-numbers': 'off',
    },
  },
  {
    ...tseslint.configs.disableTypeChecked,
    files: ['**/*.{js,mjs,cjs}'],
  },
  {
    files: ['**/*.mjs'],
    languageOptions: { globals: globals.node },
    rules: { 'no-undef': 'off' },
  },
);
