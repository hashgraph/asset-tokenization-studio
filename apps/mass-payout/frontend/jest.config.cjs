process.env.TZ = 'GMT';

module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  preset: 'ts-jest',
  ci: true,
  testTimeout: 30000,
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        isolatedModules: true,
        tsconfig: {
          module: 'esnext',
          moduleResolution: 'node',
        },
      },
    ],
    '^.+\\.svg$': '<rootDir>/svgTransform.js',
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  moduleFileExtensions: ['tsx', 'ts', 'js', 'jsx'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.tsx'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass|ttf|png)$': 'ts-jest',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    '**/views/**/*.{ts,tsx}',
    '**/components/**/*.{ts,tsx}',
    '**/layouts/**/*.{ts,tsx}',
    '!**/node_modules/**',
    '!**/vendor/**',
  ],
};
