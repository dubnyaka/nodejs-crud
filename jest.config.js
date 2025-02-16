/** @type {import('jest').Config} */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    moduleFileExtensions: ["ts", "js"],
    testMatch: ["**/__tests__/**/*.test.ts"],
    clearMocks: true,
    globalSetup: '<rootDir>/__tests__/setupTestDB.ts',
    globalTeardown: "./__tests__/globalTeardown.ts",
};
