<div align="center">

# Asset Tokenization Studio

[![License](https://img.shields.io/badge/license-apache2-blue.svg)](LICENSE)

</div>

### Table of Contents

- **[Development manifesto](#development-manifesto)**<br>
- **[Installation](#installation)**<br>
- **[Build](#build)**<br>
- **[Run](#run)**<br>
- **[Support](#support)**<br>
- **[Contributing](#contributing)**<br>
- **[Code of conduct](#code-of-conduct)**<br>
- **[License](#license)**<br>


# Development manifesto

The development of the project follows enterprise-grade practices for software development. Using DDD, hexagonal architecture, and the CQS pattern, all within an agile methodology.

## Domain driven design

By using DDD (Domain-Driven Design), we aim to create a shared language among all members of the project team, which allows us to focus our development efforts on thoroughly understanding the processes and rules of the domain. This helps to bring benefits such as increased efficiency and improved communication.


# Installation

In a terminal:

```
npm run install:all
```

This will install the dependencies in all projects and sets up the links between them.

You can now start developing in any of the modules.


# Build

When making modifications to any of the modules, you have to re-compile the dependencies, in this order, depending on which ones the modifications where made:

```bash
  // 1st
  $ npm run build:contracts
  // 2nd
  $ npm run build:sdk
  // or
  $ npm run build:web
```

# Run

In order to run the application locally:

- Clone the repository
- Install the application as described in the *Installation* section
- Create a ".env" file in the *web* module (using the ".env.sample" file as a template)
- Open a terminal and go to the *web* folder
- Run the command : __yarn dev__
- Open a browser and type in the URL displayed in the terminal (by default it will be : *http://localhost:5173*)


# Support

If you have a question on how to use the product, please see our
[support guide](https://github.com/hashgraph/.github/blob/main/SUPPORT.md).

# Contributing

Contributions are welcome. Please see the
[contributing guide](https://github.com/hashgraph/.github/blob/main/CONTRIBUTING.md)
to see how you can get involved.

# Code of conduct

This project is governed by the
[Contributor Covenant Code of Conduct](https://github.com/hashgraph/.github/blob/main/CODE_OF_CONDUCT.md). By
participating, you are expected to uphold this code of conduct. Please report unacceptable behavior
to [oss@hedera.com](mailto:oss@hedera.com).

# License

[Apache License 2.0](LICENSE)

# 🔐 Security

Please do not file a public ticket mentioning the vulnerability. Refer to the security policy defined in the [SECURITY.md](https://github.com/hashgraph/assettokenization-studio/blob/main/SECURITY.md).