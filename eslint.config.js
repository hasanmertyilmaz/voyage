// ESLint 9 flat config — extends Expo's recommended rules and turns off rules
// that conflict with Prettier formatting.
const expoConfig = require('eslint-config-expo/flat');
const prettier = require('eslint-config-prettier');

module.exports = [
  ...expoConfig,
  prettier,
  {
    ignores: ['node_modules/**', '.expo/**', 'dist/**', 'coverage/**', 'scripts/**', 'babel.config.js'],
  },
];
