// Cypress E2E support file
// This file runs before every single spec file

// Import commands
// import './commands';

// Prevent Cypress from failing tests on uncaught exceptions from the app
Cypress.on('uncaught:exception', (err, runnable) => {
    // Return false to prevent the error from failing the test
    // This is useful for third-party script errors
    return false;
});

// Global before hook - runs once before all tests
before(() => {
    // Clear local storage and session storage
    cy.clearLocalStorage();
    cy.clearAllSessionStorage();
});

// Before each test
beforeEach(() => {
    // Log the current test name for debugging
    cy.log(`Running: ${Cypress.currentTest.title}`);
});

// After each test
afterEach(() => {
    // Add any cleanup logic here
});
