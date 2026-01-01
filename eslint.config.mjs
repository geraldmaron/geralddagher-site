import nextPlugin from '@next/eslint-plugin-next';
import reactPlugin from 'eslint-plugin-react';
import hooksPlugin from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // Global ignores
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '.turbo/**',
      'out/**',
    ],
  },
  // Base config for all JS/TS files
  {
    files: ['**/*.{js,jsx,ts,tsx,mjs}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@next/next': nextPlugin,
      'react': reactPlugin,
      'react-hooks': hooksPlugin,
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      'no-console': 'off',
      'react/no-unescaped-entities': 'off',
      'react-hooks/exhaustive-deps': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.object.name='logger'][callee.property.name='debug']",
          message: 'Remove logger.debug calls',
        },
        {
          selector: "CallExpression[callee.name='debug']",
          message: 'Remove debug() calls',
        },
      ],
    },
  },
  // Test files
  {
    files: ['**/*.test.*', '**/*.spec.*'],
    rules: {
      'no-console': 'off',
      'no-restricted-syntax': 'off',
    },
  },
);
