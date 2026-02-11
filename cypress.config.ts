import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:{{ spa_utils.port }}',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    video: false,
    screenshotOnRunFailure: true,
    // Assume services are already running - don't wait unnecessarily
    defaultCommandTimeout: 4000,
    requestTimeout: 5000,
    responseTimeout: 5000,
  },
})