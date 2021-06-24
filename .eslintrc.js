module.exports = {
  env: {
    es6: true,
    node: true,
    jest: true,
  },
  extends: ['airbnb-base', 'prettier'],
  plugins: ['prettier'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: {
    'prettier/prettier': 'error',
    'class-methods-use-this': 'off',
    'no-param-reassign': 'off',
    'no-console': 'off',
    'import/no-extraneous-dependencies': 'off',
    'consistent-return': 'off',
    camelcase: 'off',
    'no-unused-vars': ['error', { argsIgnorePattern: 'next' }],
    'new-cap': 'off',
    'no-plusplus': 'off',
    'no-dupe-keys': 'off',
    'no-underscore-dangle': 'off',
    'no-await-in-loop': 'off',
    'prefer-const': 'off',
    'no-restricted-syntax': 'off',
    'import/no-dynamic-require': 'off',
    'global-require': 'off',
    'no-shadow': 'off',
    'no-prototype-builtins': 'off',
    'prefer-destructuring': 'off',
  },
};
