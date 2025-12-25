module.exports = {
    preset: 'jest-expo',
    transformIgnorePatterns: [
        'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
    ],
    setupFilesAfterEnv: ['<rootDir>/setupTests.js'],
    testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/'],
    collectCoverageFrom: ['src/**/*.{js,jsx}', '!src/**/*.test.{js,jsx}', '!src/**/index.js'],
    coverageThreshold: {
        global: {
            branches: 50,
            functions: 50,
            lines: 50,
            statements: 50,
        },
    },
    moduleNameMapper: {
        '\\.svg': '<rootDir>/__mocks__/svgMock.js',
    },
};
