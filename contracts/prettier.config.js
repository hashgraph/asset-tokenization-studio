// prettier.config.js or .prettierrc.js
module.exports = {
    trailingComma: 'es5',
    tabWidth: 4,
    semi: false,
    singleQuote: true,
    printWidth: 80,
    overrides: [
        {
            files: 'contracts/**/*.sol',
            options: {
                compiler: '0.8.18',
            },
        },
    ],
}
