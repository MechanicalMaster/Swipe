const { defineConfig } = require('cypress');

module.exports = defineConfig({
    e2e: {
        // Base URL for cy.visit() commands
        baseUrl: 'http://localhost:3000',

        // Spec file pattern
        specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',

        // Support file location
        supportFile: 'cypress/support/e2e.js',

        // Viewport size (mobile-first for this app)
        viewportWidth: 390,
        viewportHeight: 844,

        // Video recording settings
        video: false,

        // Screenshot settings
        screenshotOnRunFailure: true,

        // Timeouts
        defaultCommandTimeout: 10000,
        pageLoadTimeout: 30000,

        // Retry failed tests
        retries: {
            runMode: 2,
            openMode: 0,
        },

        setupNodeEvents(on, config) {
            // Implement node event listeners here if needed
        },
    },
});
