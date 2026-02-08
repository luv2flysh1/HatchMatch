const jestExpoPreset = require('jest-expo/jest-preset');

module.exports = {
  ...jestExpoPreset,

  testMatch: ['**/__tests__/screens/**/*.test.tsx'],

  setupFilesAfterEnv: ['./jest.setup.js', './jest.setup.component.js'],

  moduleNameMapper: {
    ...jestExpoPreset.moduleNameMapper,
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|zustand)',
  ],
};
