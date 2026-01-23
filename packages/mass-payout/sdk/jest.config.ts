// SPDX-License-Identifier: Apache-2.0

import type { Config } from "jest";

enum TestType {
  UNIT = "unit",
  INTEGRATION = "integration",
  E2E = "e2e",
}

const MAX_WORKERS = process.env.MAX_WORKERS || 4;

const config: Config = {
  moduleFileExtensions: ["js", "json", "ts"],
  moduleNameMapper: {
    "@app(.*)$": "<rootDir>/src/app/$1",
    "@core(.*)$": "<rootDir>/src/core/$1",
    "@domain(.*)$": "<rootDir>/src/domain/$1",
    "@port(.*)$": "<rootDir>/src/port/$1",
  },
  rootDir: ".",
  testRegex: ".*\\.spec\\.ts$",
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
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
};

function getConfigProjectBy(testType: TestType): Config {
  return {
    ...config,
    displayName: testType.toString(),
    testRegex: `test/${testType.toString()}/.*\\.spec\\.ts`,
  };
}

module.exports = {
  maxWorkers: MAX_WORKERS,
  projects: [
    getConfigProjectBy(TestType.UNIT),
    getConfigProjectBy(TestType.E2E),
    getConfigProjectBy(TestType.INTEGRATION),
  ],
  verbose: false,
};
