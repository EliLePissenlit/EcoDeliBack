import type { JestConfigWithTsJest } from 'ts-jest';

const jestConfig: JestConfigWithTsJest = {
  globalTeardown: '<rootDir>/src/__tests__/utils/globalTeardown.ts',
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  testPathIgnorePatterns: ['<rootDir>/src/__tests__/utils', '<rootDir>/dist/__tests__/utils'],
  testTimeout: 60000,
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        babelConfig: true,
      },
    ],
  },
};

export default jestConfig;
