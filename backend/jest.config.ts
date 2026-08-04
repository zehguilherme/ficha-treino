/** @jest-config-loader esbuild-register */

import type { Config } from 'jest';

const config: Config = {
  transform: {
    '^.+\\.ts$': '@swc/jest',
  },
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/*.test.ts'],
};

export default config;
