// Runs only the design-data export (scripts/design-data/export.design.ts) with the app's Jest setup.
const app = require('../../package.json').jest;

module.exports = {
  ...app,
  rootDir: '../..',
  testMatch: ['<rootDir>/scripts/design-data/export.design.ts'],
  testPathIgnorePatterns: ['/node_modules/'],
};
