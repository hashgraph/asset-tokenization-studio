# Asset Tokenization Studio Documentation

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

## Installation

```bash
npm ci
```

## Local Development

```bash
npm start
```

This command starts a local development server and opens up a browser window at `http://localhost:3010/asset-tokenization-studio/`. Most changes are reflected live without having to restart the server.

## Build

```bash
npm run build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

## Serve Built Site Locally

```bash
npm run serve
```

This serves the production build locally for testing before deployment.

## Clear Cache

```bash
npm run clear
```

Clears the Docusaurus cache, useful when experiencing build issues.

## Type Checking

```bash
npm run typecheck
```

Runs TypeScript type checking on the documentation site.

## Deployment

The documentation site is automatically deployed to GitHub Pages when changes are pushed to the main branch.

For manual deployment using SSH:

```bash
USE_SSH=true npm run deploy
```

For manual deployment without SSH:

```bash
GIT_USER=<Your GitHub username> npm run deploy
```
