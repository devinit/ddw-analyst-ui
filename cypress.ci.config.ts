import { defineConfig } from 'cypress'

export default defineConfig({
  fixturesFolder: 'frontend/cypress/fixtures',
  screenshotOnRunFailure: false,
  video: false,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./frontend/cypress/plugins/index.js')(on, config)
    },
    baseUrl: 'https://staging-ddw.devinit.org',
    specPattern: 'frontend/cypress/integration/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'frontend/cypress/support/index.js',
  },
})
