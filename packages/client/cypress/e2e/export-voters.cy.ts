/// <reference types="cypress" />

describe("Voter CSV Export", () => {
  const uniqueUserSuffix = Date.now();
  // testUserEmail, testUserPassword, and canvasserName are no longer needed here
  // as cy.login() will handle user creation/login.

  beforeEach(() => {
    cy.login().then(() => {
      // After login, visit the root of the app to trigger auth guards/redirects
      cy.visit("/");
      // Ensure login was successful and we are on the dashboard
      cy.url().should("include", "/dashboard");
      cy.get('[data-cy="dashboard-title"]').should("be.visible");
    });
  });

  it("should allow a logged-in user to export voters as CSV", () => {
    // --- 1. Add a couple of voters to ensure data for export ---
    const voter1Name = `Voter One ${uniqueUserSuffix}`;
    const voter1Email = `voter1_${uniqueUserSuffix}@example.com`;
    const voter2Name = `Voter Two ${uniqueUserSuffix}`;

    // Add first voter
    cy.get('[data-cy="add-voter-button"]').click();
    cy.get('[data-cy="create-voter-name-input"]').type(voter1Name);
    cy.get('[data-cy="create-voter-email-input"]').type(voter1Email);
    cy.get('[data-cy="create-voter-notes-textarea"]').type("Notes for voter 1");
    cy.get('[data-cy="create-voter-save-button"]').click();
    cy.get('[data-cy="voters-table"]').should("contain", voter1Name);

    // Add second voter (name only)
    cy.get('[data-cy="add-voter-button"]').click();
    cy.get('[data-cy="create-voter-name-input"]').type(voter2Name);
    cy.get('[data-cy="create-voter-save-button"]').click();
    cy.get('[data-cy="voters-table"]').should("contain", voter2Name);

    // --- 2. Find and click the Export CSV button ---
    // We'll assume the button has text 'Export CSV'
    // Intercept the download. Cypress doesn't download files directly.
    // We check if the browser is prompted to download.
    // This often involves checking a link's 'href' and 'download' attributes
    // or intercepting a GET request if it's an API-driven download.

    // For a simple link-based download:
    // cy.get('a[download="voters.csv"]').click();

    // If it's a button that triggers a JavaScript download, we might need to be more creative.
    // Let's assume there's a button with the text "Export CSV"
    // We will click it and then check for a network request or a specific browser event.

    // For now, let's just try to click the button.
    // We'll need to know the actual selector or text of the export button.
    // Assuming it's a button with text "Export CSV"
    cy.get('[data-cy="export-csv-button"]')
      .should("be.visible")
      .and("not.be.disabled")
      .click();

    // --- 3. Verify the downloaded CSV file content ---
    // Wait a moment for the download to complete, then read the file.
    // The path is relative to the project root if not otherwise configured.
    // Since Cypress tests run from `packages/client`, the path will be `cypress/downloads/voters.csv`
    const downloadedFilename = "cypress/downloads/voters.csv";

    // It's good practice to ensure the file exists and to wait a bit for it to be written.
    // Cypress commands are automatically retried, so cy.readFile will retry for a bit.
    // Adding an explicit wait can sometimes help with larger files or slower systems.
    // cy.wait(1000); // Wait 1 second for the file to be written - REMOVED to rely on readFile retry

    cy.readFile(downloadedFilename).then((fileContent) => {
      expect(fileContent).to.include("Name,Email,Notes"); // Check for header row
      expect(fileContent).to.include(voter1Name);
      expect(fileContent).to.include(voter1Email);
      expect(fileContent).to.include("Notes for voter 1");
      expect(fileContent).to.include(voter2Name);
      // Voter 2 has no email or notes, so we don't check for those for voter2 specifically
      // but ensure their name is present.
      cy.log("Downloaded CSV content verified.");
    });
  });
});
