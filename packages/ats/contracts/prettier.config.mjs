/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
    trailingComma: 'es5',
    tabWidth: 4,
    singleQuote: true,
    printWidth: 80,
    semi: false,
    plugins: ['prettier-plugin-solidity'],
    overrides: [
        {
            files: 'contracts/**/*.sol',
            options: {
                compiler: '0.8.18',
            },
        },
    ],
}

export default config
