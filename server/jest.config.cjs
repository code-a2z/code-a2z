/** Jest config for ESM (type: module) - use run with NODE_OPTIONS=--experimental-vm-modules */
module.exports = {
  testEnvironment: 'node',
  transform: {},
  testMatch: ['**/__tests__/**/*.test.js', '**/*.test.js'],
  testPathIgnorePatterns: ['/node_modules/'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testTimeout: 20000,
  verbose: true,
  forceExit: true,
};
