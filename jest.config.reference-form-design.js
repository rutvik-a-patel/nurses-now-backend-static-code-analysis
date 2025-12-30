module.exports = {
  moduleFileExtensions: ['js', 'ts'],
  rootDir: 'src',
  testRegex: 'reference-form-design.*.spec.ts',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: ['reference-form-design/**/*.{ts,js}'],
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
