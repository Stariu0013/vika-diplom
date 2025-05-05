export default {
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'jsx'],
  moduleNameMapper: {
    // Handle CSS imports (with CSS modules)
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
    // Handle CSS imports (without CSS modules)
    '^.+\\.(css|sass|scss)$': '<rootDir>/__mocks__/styleMock.js',
    // Handle image imports
    '^.+\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js'
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.js'],
  testMatch: ['<rootDir>/tests/**/*.test.{js,jsx}'],
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  }
};
