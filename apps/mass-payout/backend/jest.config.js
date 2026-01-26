// SPDX-License-Identifier: Apache-2.0

const TestType = {
  UNIT: "unit",
  INTEGRATION: "integration",
  E2E: "e2e",
}

const MAX_WORKERS = process.env.MAX_WORKERS || 4

const config = {
  moduleFileExtensions: ["js", "json", "ts"],
  moduleNameMapper: {
    "@domain(.*)$": "<rootDir>/src/domain/$1",
    "@application(.*)$": "<rootDir>/src/application/$1",
    "@infrastructure(.*)$": "<rootDir>/src/infrastructure/$1",
    "@config(.*)$": "<rootDir>/src/config/$1",
    "@shared(.*)$": "<rootDir>/src/shared/$1",
    "@test(.*)$": "<rootDir>/test/$1",
  },
  rootDir: ".",
  testRegex: ".*\\.spec\\.ts$",
  transform: {
    "^.+\\.ts$": "ts-jest",
    "^.+\\.js$": "babel-jest",
  },
  transformIgnorePatterns: [
    "node_modules/(?!(did-jwt|@terminal3|@hashgraph/asset-tokenization-sdk|@scure|@noble|multiformats|chalk)/)",
  ],
  collectCoverageFrom: [
    "src/**/*.{js,ts}",
    "!src/config/**",
    "!src/shared/infrastructure/rest/controller/**",
    "!src/main.ts",
    "!src/app.module.ts",
  ],
  coverageDirectory: "<rootDir>/coverage",
  testEnvironment: "node",
  moduleDirectories: ["node_modules", "<rootDir>"],
}

function getConfigProjectBy(testType) {
  return {
    ...config,
    displayName: testType.toString(),
    testRegex: `test/${testType.toString()}/.*\\.spec\\.ts`,
  }
}

module.exports = {
  maxWorkers: MAX_WORKERS,
  projects: [
    getConfigProjectBy(TestType.UNIT),
    getConfigProjectBy(TestType.E2E),
    getConfigProjectBy(TestType.INTEGRATION),
  ],
  verbose: false,
}
