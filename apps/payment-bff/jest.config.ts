import { readFileSync } from 'fs';
import { offsetFromRoot, workspaceRoot } from '@nx/devkit';
import * as path from 'node:path';

const displayName = 'payment-bff';
const projectRoot = 'apps/payment-bff';

// Reading the SWC compilation config for the spec files
const swcJestConfig = JSON.parse(
  readFileSync(path.join(__dirname, '.spec.swcrc'), 'utf-8')
);
const jestPreset = path.join(offsetFromRoot(projectRoot), 'jest.preset.js');

// Disable .swcrc look-up by SWC core because we're passing in swcJestConfig ourselves
swcJestConfig.swcrc = false;

export default {
  displayName,
  preset: jestPreset,
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['@swc/jest', swcJestConfig],
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  coverageDirectory: `${workspaceRoot}/dist/test-report/${displayName}/jest/coverage`,
  transformIgnorePatterns: ['/node_modules/'],
  coveragePathIgnorePatterns: ['<rootDir>/build-lambda.js'],
};
