describe("Full Canvasser Workflow", () => {
  // Use a dynamic email for each test run to avoid "email already exists" errors
  const userEmail = `testuser_${Date.now()}@example.com`;
  const userName = "Cypress Test";
  const userPassword = "password123";

  const voterName = "Jane Voter";
  const voterEmail = "jane.voter@test.com";

  beforeEach(() => {
    // Clear local storage before each test to ensure no token is persisted.
    cy.clearLocalStorage();
  });

  it("should allow a user to register, log in, add a voter, and see the voter in the list", () => {
    // --- 1. Registration ---
    cy.visit("/register");

    cy.contains("Sign Up").should("be.visible");

    cy.get('input[name="name"]').type(userName);
    cy.get('input[name="email"]').type(userEmail);
    cy.get('input[name="password"]').type(userPassword);
    cy.get('button[type="submit"]').click();

    // Assert we are redirected to the login page
    cy.url().should("include", "/login");

    // --- 2. Login ---
    cy.get('input[name="email"]').type(userEmail);
    cy.get('input[name="password"]').type(userPassword);
    cy.get('button[type="submit"]').click();

    // Assert we are redirected to the dashboard
    cy.url().should("include", "/dashboard");

    // --- 3. Add a new Voter ---
    // Initially, the list should be empty
    cy.contains("No voters found").should("be.visible");

    // Click the button to open the "Create Voter" dialog
    cy.contains("button", "Add Voter").click();
    cy.contains("h2", "Create New Voter").should("be.visible");

    // Fill out the form in the dialog
    cy.get('input[placeholder="Voter\'s full name"]').type(voterName);
    cy.get('input[placeholder="voter@example.com"]').type(voterEmail);
    cy.get('textarea[placeholder="Any relevant notes..."]').type(
      "This is a test note from Cypress."
    );

    // Save the new voter
    cy.contains("button", "Save Voter").click();

    // Assert the dialog is gone and success toast appears
    cy.contains("h2", "Create New Voter").should("not.exist");
    cy.contains("Edit").should("be.visible");

    // --- 4. Verify the new voter is in the list ---
    // The "No voters found" message should be gone
    cy.contains("No voters found").should("not.exist");

    // The new voter's details should be on the page
    cy.get("table").should("contain", voterName);
    cy.get("table").should("contain", voterEmail);
    cy.get("table").should("contain", "This is a test note from Cypress.");
  });
});
