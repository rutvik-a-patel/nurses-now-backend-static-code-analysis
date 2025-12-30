module.exports = {
  moduleFileExtensions: ['js', 'ts'],
  rootDir: 'src',
  testRegex: [
    '/skill-checklist-module.controller.spec.ts',
    '/skill-checklist-module.service.spec.ts',
  ],
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: ['skill-checklist-module/**/*.{ts,js}'],
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
