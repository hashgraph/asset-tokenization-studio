# iobricks-ui

## Description

IoBricksUI provides a set of accessible, reusable, and composable React components that make it super easy to create our projects.

Mostly uses [ChakraUI](https://github.com/chakra-ui/chakra-ui) under the hood.

## Installation of the package

```
yarn add @iobuilders/io-bricks-ui
```

## Contribute

To contribute to this project:

### Installation

```
yarn install

yarn install-peers
```

### Run

```
yarn dev
yarn dev-watch // (advanced use when it's linked to another project)

yarn test
```

## Contributing

Pull requests are welcome.

### How to release a new version?

New versions can only be released by those authorized to make sure we have the best developer experience. Keep in mind this affects to the projects of Iobuilders.

1. Make sure you are on `main` and have the latest changes.
2. Make sure `CHANGELOG` has been correctly updated and changes have been moved away from `Unreleased`.
3. Bump version on `package.json` and commit as `vX.X.X`.
4. Run `yarn rollup && yarn publish`
5. Generate tag with the format `vX.X.X`, push main's branch and tag (`git push origin vX.X.X`) to repository.
