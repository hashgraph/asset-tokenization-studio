/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  testEnvironment: "node",
  preset: "ts-jest",
  clearMocks: true,
  testTimeout: 20_000,
  rootDir: "./src",
  modulePaths: ["<rootDir>"],
  setupFiles: ["jest-canvas-mock"],
  setupFilesAfterEnv: [
    "@testing-library/jest-dom/extend-expect",
    "../setupTests.tsx",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^@Components/(.*)$": "<rootDir>/Components/$1",
    "^@Theme/(.*)$": "<rootDir>/Theme/$1",
    "^@Hooks/(.*)$": "<rootDir>/Hooks/$1",
    "\\.(css|less|scss|sass|ttf)$": "ts-jest",
  },
  transform: {
    '^.+\\.ts?$': 'ts-jest',
    "^.+\\.svg$": "../svgTransform.js",
  },
  collectCoverage: true,
  coverageDirectory: '../coverage/ui',
};
