import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    // The base URL of your development server.
    // Cypress will automatically prepend this to cy.visit() and cy.request() commands.
    baseUrl: "http://localhost:3005",

    // We can add tasks and other configurations here later.
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
