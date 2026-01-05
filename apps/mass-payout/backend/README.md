# Scheduler Payment Distribution service

## Table of Contents

- [Installation](#installation)
- [Running the app](#running-the-app)
- [Test](#test)

## Installation

install node version `22.17.0`

Create a `.env` file with the following command:

```bash
  cp .env.example .env
```

Install dependencies with the following command:

```bash
  npm install
```

Start the postgres database with the docker-compose file:

```bash
docker-compose up -d
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# all tests
$ npm run test

# unit tests
$ npm run test:unit

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

# IDE configuration

## VSCode

1. Install both [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) and
   [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) plugins.
2. Open VSCode's preferences: command + shift + p -> search for 'open user settings (JSON)'
3. Copy these parameters:

```json
"editor.formatOnPaste": true,
"editor.defaultFormatter": "esbenp.prettier-vscode",
"editor.codeActionsOnSave": {
"source.organizeImports": true
}
```

## IntelliJ

1. Open settings
2. Navigate to Languages & Frameworks > Javascript > Prettier
3. Check both 'Automatic Prettier configuration' & 'Run on save'
4. Navigate to Tools > Actions on Save
5. Check 'Optimize imports'

---

## 📚 Documentation

For more information about the project, see:

- [Guides](https://github.com/hashgraph/asset-tokenization-studio/tree/main/docs/guides)
- [API Documentation](https://github.com/hashgraph/asset-tokenization-studio/tree/main/docs/api)
- [References](https://github.com/hashgraph/asset-tokenization-studio/tree/main/docs/references)
