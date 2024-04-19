process.env.TZ = "GMT";

module.exports = {
  testEnvironment: "jest-environment-jsdom",
  preset: "ts-jest",
  transform: {
    "^.+\\.(ts|tsx)?$": "ts-jest",
    "^.+\\.(js|jsx)$": "babel-jest",
    "^.+\\.svg$": "<rootDir>/svgTransform.js",
  },
  moduleFileExtensions: ["tsx", "ts", "js", "jsx"],
  setupFilesAfterEnv: [
    "@testing-library/jest-dom/extend-expect",
    "./jest.setup.tsx",
  ],
  moduleNameMapper: {
    "^@iob/io-axios-services/(.*)$":
      "<rootDir>/node_modules/@iob/io-axios-services/lib/$1.js",
    "\\.(css|less|scss|sass|ttf|png)$": "ts-jest",
  },
  testTimeout: 20000,
  collectCoverageFrom: [
    "**/views/**/*.{ts,tsx}",
    "**/components/**/*.{ts,tsx}",
    "**/layouts/**/*.{ts,tsx}",
    "!**/node_modules/**",
    "!**/vendor/**",
  ],
};
