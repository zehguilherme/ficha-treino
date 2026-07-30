/** @jest-config-loader esbuild-register */

import type { Config } from 'jest';

const config: Config = {
  transform: {
    '^.+\\.ts$': '@swc/jest',
  },
  extensionsToTreatAsEsm: ['.ts'],
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/*.test.ts'],
};

export default config;
