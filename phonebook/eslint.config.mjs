import eslintPluginStylistic from '@stylistic/eslint-plugin'

export default [
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: {
      stylistic: eslintPluginStylistic,
    },
    rules: {
      'stylistic/indent': ['warn', 2],
      'stylistic/linebreak-style': ['warn', 'unix'],
      'stylistic/quotes': ['warn', 'single'],
      'stylistic/semi': ['warn', 'never'],
      eqeqeq: 'error',
      'no-trailing-spaces': 'warn',
      'object-curly-spacing': ['error', 'always'],
      'arrow-spacing': ['error', { before: true, after: true }],
      'no-console': 'off',
    },
    ignores: ['dist/**', 'node_modules/**', 'build/**'],
  }
]
