// Placeholder jest.config.js for web-frontend
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/setupTests.js'], // if you have a setup file
  moduleNameMapper: {
    // Handle module aliases (if configured in tsconfig.json or jsconfig.json)
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/pages/(.*)$': '<rootDir>/pages/$1',
    // Handle CSS imports (if using CSS Modules or similar)
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    // Handle image imports
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/__mocks__/fileMock.js',
  },
  // Add more configuration options as needed
};
