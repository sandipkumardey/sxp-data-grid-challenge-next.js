const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  // Add more setup options before each test is run
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // if using TypeScript with a baseUrl set to the root directory then you need the below for alias' to work
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    // Handle module aliases (this will be automatically configured for you by next/jest)
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
    // Handle CSS imports (without CSS modules)
    '^.+\\.(css|sass|scss)$': 'identity-obj-proxy',
    // Handle image imports
    '^.+\\.(png|jpg|jpeg|gif|webp|avif|ico|bmp|svg)$': '<rootDir>/__mocks__/fileMock.js',
    // Mock AG Grid CSS imports
    '^ag-grid-community/styles/ag-grid.css$': '<rootDir>/__mocks__/ag-grid-community_styles_ag-grid.css',
    '^ag-grid-community/styles/ag-theme-quartz.css$': '<rootDir>/__mocks__/ag-grid-community_styles_ag-theme-quartz.css',
    // Mock nuqs
    '^nuqs$': '<rootDir>/__mocks__/nuqs.js',
  },
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  transform: {
    // Use babel-jest to transpile tests with the next/babel preset
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { 
      presets: [
        'next/babel',
        '@babel/preset-typescript',
      ],
      plugins: [
        ['@babel/plugin-transform-modules-commonjs', { loose: true }],
        ['@babel/plugin-proposal-class-properties', { loose: true }],
        '@babel/plugin-transform-runtime',
      ],
    }],
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(ag-grid-community|ag-grid-react|@ag-grid-community|nuqs)/)',
  ],
  // Add this to handle the 'jest' global
  setupFiles: ['<rootDir>/jest.polyfills.js'],
  // Add this to handle ESM modules
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  // Add this to handle TypeScript files
  globals: {
    'ts-jest': {
      useESM: true,
      tsconfig: 'tsconfig.json',
    },
  },
  // Add this to handle ESM modules in node_modules
  transformIgnorePatterns: [
    '/node_modules/(?!(nuqs|@babel/runtime|@babel/plugin-transform-runtime|@babel/helpers|@babel/runtime-corejs3|@babel/plugin-transform-modules-commonjs|@babel/plugin-proposal-class-properties)/)',
  ],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
