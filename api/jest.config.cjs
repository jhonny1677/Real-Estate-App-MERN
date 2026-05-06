// .cjs extension required because api/package.json has "type": "module"
module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  testMatch: ['**/tests/**/*.test.js'],
  transformIgnorePatterns: ['/node_modules/'],
};
