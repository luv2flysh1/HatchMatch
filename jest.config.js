module.exports = {
  // Use a simple node environment for pure utility tests
  testEnvironment: 'node',

  // Transform TypeScript files
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
  },

  // Module resolution
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Test file patterns
  testMatch: ['**/__tests__/**/*.test.ts'],

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/mocks/',
    // Skip component tests for now until Expo compatibility is fixed
    '/__tests__/screens/',
  ],

  // Coverage settings
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/types/**',
    '!src/app/**', // Skip React components for now
  ],

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
