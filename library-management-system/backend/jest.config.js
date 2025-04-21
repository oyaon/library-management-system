module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/*.test.js'],
    verbose: true,
    forceExit: true,
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true,
    setupFilesAfterEnv: ['<rootDir>/src/tests/setup.js'],
    testTimeout: 10000,
    detectOpenHandles: true,
    maxConcurrency: 1,
    maxWorkers: 1
};
