module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: [
        '@typescript-eslint',
    ],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier',
    ],
    rules: {
        '@typescript-eslint/no-inferrable-types': "off",
        '@typescript-eslint/no-empty-function': ["warn", { "allow": ["private-constructors"] }],
    },
};