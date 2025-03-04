const path = require('path');

module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',

    'eslint-config-prettier',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh', "simple-import-sort"],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    "@typescript-eslint/no-explicit-any": "off",
    "simple-import-sort/imports": [
      'error',
      {
        groups: [
          // Packages (importing from `node_modules`)
          ['^@?\\w'],
          // Absolute imports and relative imports (not starting with ./)
          ['^@/', '^@c/', '^[^.]'],
          // Relative imports (starting with ./)
          ['^\\.'],
          // Group for side effects (e.g. polyfills)
          ['^\\u0000'],
          // Style imports (e.g. .css, .scss, .sass, .less, etc.)
          ['^.+\\.less$', '^.+\\.css$', '^.+\\.scss$', '^.+\\.sass$'],
        ],
      },
    ],
    "simple-import-sort/exports": "error"
  },
  settings: {
    'import/resolver': {
      alias: {
        map: [
          ['@', path.resolve(__dirname, 'src')],
          ['@c', path.resolve(__dirname, 'src/components')]
        ],
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      },
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      }
    }
  }
}
