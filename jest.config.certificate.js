module.exports = {
  moduleFileExtensions: ['js', 'ts'],
  rootDir: 'src',
  testRegex: 'certificate.*.spec.ts',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: ['certificate/**/*.{ts,js}'],
  coveragePathIgnorePatterns: [
    '.*\\.entity\\.ts$',
    '.*\\.dto\\.ts$',
    '.*\\.module\\.ts$',
    '/src/shared',
  ],
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
