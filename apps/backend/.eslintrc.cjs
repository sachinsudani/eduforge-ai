module.exports = {
    root: true,
    env: { node: true, es2022: true },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended'
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: { project: null, sourceType: 'module' },
    rules: {}
}
