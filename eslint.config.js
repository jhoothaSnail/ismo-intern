import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.property.name='$queryRawUnsafe']",
          message: 'Use $queryRaw with a tagged template literal instead.',
        },
        {
          selector: "CallExpression[callee.property.name='$executeRawUnsafe']",
          message: 'Use $executeRaw with a tagged template literal instead.',
        },
      ],
    },
  },
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/.expo/**', '**/android/**', '**/ios/**'],
  },
);
