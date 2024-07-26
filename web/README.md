<div align="center">

# Asset Tokenization Studio - Web

[![License](https://img.shields.io/badge/license-apache2-blue.svg)](../LICENSE)

</div>

### Table of Contents

- **[Description](#description)**<br>
- **[Private dependencies](#private-dependencies)**<br>
- **[Yarn Version Compatibility](#yarn-version-compatibility)**<br>
- **[Installation](#installation)**<br>


# Description

Backoffice for Red Swan - Phase1a.


# Private dependencies

This project has some private dependencies, so in order to install you would need to add a gitlab private token.

1. Go to Your profile > Access Tokens: [Link](https://gitlab.com/-/profile/personal_access_tokens)
2. Insert "npm" on "Token name".
3. Leave "Expiration date" empty.
4. Very important, in "Select scopes" you must select exclusively "read_api". Do NOT mark more.
5. Click on "Create personal access token"
6. Copy the generated token.
7. Run the following commands, bore in mind that you need to change from `<your_token>` to the previously generated token:

```
```

Now everything is ready to work, and `yarn install` could be run.

# Yarn Version Compatibility

This project is compatible with Yarn version 1.22.19. Please ensure you have this version installed before running any yarn commands. If you need to install this version, you can run:

```
npm install -g yarn@1.22.19
```

# Installation

First, verify that you have the correct version of Yarn installed by running `yarn --version`. You should see `1.22.19` as the output.

Then, install the project dependencies with:

```
yarn
```
