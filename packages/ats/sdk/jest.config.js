const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.json');

module.exports = {
  testEnvironment: 'node',
  preset: 'ts-jest',
  testMatch: ['**/(__tests__|src)/**/*.(test|spec).[jt]s?(x)'],
  testPathIgnorePatterns: ['/build/', '/src_old/'],
  modulePathIgnorePatterns: ['/build/'],
  collectCoverage: true,
  coverageDirectory: '../../../coverage/sdk',
  collectCoverageFrom: [
    'src/**/*.ts',
    'src/**/*.mts',
    '!src/**/*.d.ts',
    '!src/**/*.d.mts',
  ],
  transform: {
    '^.+\\.ts?$': ['ts-jest', { isolatedModules: true }],
    '^.+\\.[t|j]sx?$': 'babel-jest',
    '^.+\\.m?js$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@terminal3/vc_core|@terminal3/ecdsa_vc|did-jwt|@scure/base|@noble/curves|@noble/hashes)/)',
  ],
  setupFilesAfterEnv: ['./__tests__/jest-setup-file.ts'],
  testTimeout: 10_000,
  moduleNameMapper: {
    ...pathsToModuleNameMapper(compilerOptions.paths, {
      prefix: '<rootDir>/',
    }),
    '^(\\.{1,2}/.*)\\.(m)?js$': '$1',
  },
};
