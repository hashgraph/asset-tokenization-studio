// prettier.config.js, .prettierrc.js, prettier.config.mjs, or .prettierrc.mjs

/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import("prettier").Config}
 */
const config = {
    trailingComma: 'es5',
    tabWidth: 4,
    semi: true,
    singleQuote: true,
    bracketSpacing: true,
    plugins: ['prettier-plugin-solidity'],
    overrides: [
        {
            files: '*.sol',
            options: {
                parser: 'solidity-parse',
                printWidth: 80,
                tabWidth: 4,
                useTabs: false,
                singleQuote: false,
                bracketSpacing: true,
            },
        },
    ],
};

export default config;
