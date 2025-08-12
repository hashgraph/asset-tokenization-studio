process.env.TZ = 'GMT';

module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  preset: 'ts-jest',
  testTimeout: 30000,
  transform: {
    '^.+\\.(ts|tsx)?$': [
      'ts-jest',
      {
        tsconfig: './tsconfig.jest.json',
      },
    ],
    '^.+\\.(js|jsx)$': 'babel-jest',
    '^.+\\.svg$': '<rootDir>/svgTransform.js',
  },
  moduleFileExtensions: ['tsx', 'ts', 'js', 'jsx'],
  setupFiles: ['./jest.polyfills.js'],
  setupFilesAfterEnv: [
    '@testing-library/jest-dom/extend-expect',
    './jest.setup.tsx',
  ],
  moduleNameMapper: {
    '^@hashgraph/io-axios-services/(.*)$':
      '<rootDir>/node_modules/@hashgraph/io-axios-services/lib/$1.js',
    '\\.(css|less|scss|sass|ttf|png)$': 'ts-jest',
  },
  moduleDirectories: [
    'node_modules',
    '<rootDir>/node_modules',
    '<rootDir>/../../node_modules',
  ],
  collectCoverageFrom: [
    '**/views/**/*.{ts,tsx}',
    '**/components/**/*.{ts,tsx}',
    '**/layouts/**/*.{ts,tsx}',
    '!**/node_modules/**',
    '!**/vendor/**',
  ],
  transformIgnorePatterns: [
    '/node_modules/(?!(@hashgraph/asset-tokenization-sdk|@notabene/pii-sdk|multiformats|fireblocks-sdk|did-jwt|uuid|uint8arrays|@terminal3|jsonld)/)',
  ],
};
