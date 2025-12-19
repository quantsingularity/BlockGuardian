const nextJest = require('next/jest');

const createJestConfig = nextJest({
    dir: './',
});

const customJestConfig = {
    setupFilesAfterEnv: ['<rootDir>/setupTests.js'],
    testEnvironment: 'jsdom',
    moduleNameMapper: {
        '^@/components/(.*)$': '<rootDir>/components/$1',
        '^@/pages/(.*)$': '<rootDir>/pages/$1',
        '^@/services/(.*)$': '<rootDir>/services/$1',
        '^@/utils/(.*)$': '<rootDir>/utils/$1',
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '\\.(gif|ttf|eot|svg|png|jpg|jpeg)$': '<rootDir>/__mocks__/fileMock.js',
    },
    collectCoverageFrom: [
        'components/**/*.{js,jsx}',
        'pages/**/*.{js,jsx}',
        'services/**/*.{js,jsx}',
        'utils/**/*.{js,jsx}',
        '!pages/_app.js',
        '!pages/_document.js',
        '!**/*.test.{js,jsx}',
        '!**/__tests__/**',
    ],
    coverageThreshold: {
        global: {
            branches: 50,
            functions: 50,
            lines: 50,
            statements: 50,
        },
    },
    testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
    testPathIgnorePatterns: ['/node_modules/', '/.next/', '/e2e/'],
};

module.exports = createJestConfig(customJestConfig);
