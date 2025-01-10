process.env.TZ = "GMT";

module.exports = {
  testEnvironment: "jest-environment-jsdom",
  preset: "ts-jest",
  ci: true,
  testTimeout: 30000,
  transform: {
    "^.+\\.(ts|tsx)?$": "ts-jest",
    "^.+\\.(js|jsx)$": "babel-jest",
    "^.+\\.svg$": "<rootDir>/svgTransform.js"

  },
  moduleFileExtensions: ["tsx", "ts", "js", "jsx"],
  setupFilesAfterEnv: [
    "@testing-library/jest-dom/extend-expect",
    "./jest.setup.tsx",
  ],
  moduleNameMapper: {
    "^@hashgraph/io-axios-services/(.*)$":
      "<rootDir>/node_modules/@hashgraph/io-axios-services/lib/$1.js",
    "\\.(css|less|scss|sass|ttf|png)$": "ts-jest",
  },
  collectCoverageFrom: [
    "**/views/**/*.{ts,tsx}",
    "**/components/**/*.{ts,tsx}",
    "**/layouts/**/*.{ts,tsx}",
    "!**/node_modules/**",
    "!**/vendor/**",
  ],
  transformIgnorePatterns: [
    "/node_modules/(?!@hashgraph/asset-tokenization-sdk|multiformats|fireblocks-sdk|did-jwt|uuid|uint8arrays).*/",
  ],
};
