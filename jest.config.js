module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    '**/*.js',
    '!**/coverage/**',
    '!**/node_modules/**',
  ],
  coverageDirectory: './coverage/',
  moduleFileExtensions: ['js', 'yml'],
  testMatch: [
    '**/test/*.yml',
    '**/tests/*.yml'
  ],
  verbose: true
}
