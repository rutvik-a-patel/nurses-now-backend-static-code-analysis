module.exports = {
  moduleFileExtensions: ['js', 'ts'],
  rootDir: 'src',
  testRegex: 'activity.*.spec.ts',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['activity/**/*.{ts,js}'],
  coveragePathIgnorePatterns: [
    '.*\\.entity\\.ts$',
    '.*\\.dto\\.ts$',
    '.*\\.module\\.ts$',
    '/src/shared',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  coverageReporters: ['json', 'lcov', 'text'],
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'coverage',
        outputName: 'clover.xml',
      },
    ],
  ],
};
