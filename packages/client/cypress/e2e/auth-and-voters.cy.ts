/// <reference types="cypress" />

describe("Registration Form Validation", () => {
  beforeEach(() => {
    cy.visit("/register");
  });

  it("should initially have a disabled submit button and validate fields on blur", () => {
    // Check initial state: button disabled
    cy.get('[data-cy="register-submit-button"]').should("be.disabled");

    // Name field validation
    cy.get('[data-cy="register-name-input"]').type("J").blur(); // Min 2 chars, so 'J' is invalid by current zod
    cy.contains("Name must be at least 2 characters.").should("be.visible");
    cy.get('[data-cy="register-submit-button"]').should("be.disabled");
    cy.get('[data-cy="register-name-input"]').clear().type("John Doe").blur();
    cy.contains("Name must be at least 2 characters.").should("not.exist");

    // Email field validation
    cy.get('[data-cy="register-email-input"]').type("invalid-email").blur();
    cy.contains("Invalid email address.").should("be.visible");
    cy.get('[data-cy="register-submit-button"]').should("be.disabled");
    cy.get('[data-cy="register-email-input"]')
      .clear()
      .type("valid@example.com")
      .blur();
    cy.contains("Invalid email address.").should("not.exist");

    // Password field validation (min 8 characters)
    cy.get('[data-cy="register-password-input"]').type("short").blur();
    cy.contains("Password must be at least 8 characters.").should("be.visible");
    cy.get('[data-cy="register-submit-button"]').should("be.disabled");
    cy.get('[data-cy="register-password-input"]')
      .clear()
      .type("password123")
      .blur();
    cy.contains("Password must be at least 8 characters.").should("not.exist");

    // All fields valid, button should be enabled
    cy.get('[data-cy="register-submit-button"]').should("be.enabled");

    // Make a field invalid again
    cy.get('[data-cy="register-password-input"]').clear().type("short").blur();
    cy.contains("Password must be at least 8 characters.").should("be.visible");
    cy.get('[data-cy="register-submit-button"]').should("be.disabled");
  });

  // You could add another 'it' block for successful submission after valid input
  // but the Full Canvasser Workflow already covers successful registration.
});

describe("Full Canvasser Workflow", () => {
  // userEmail, userName, and userPassword are no longer needed here as cy.login() handles it.

  const voterName = "Jane Voter";
  const voterEmail = "jane.voter@test.com";

  beforeEach(() => {
    cy.login().then(() => {
      // After login, visit the root of the app to trigger auth guards/redirects
      cy.visit("/");
      // Ensure login was successful and we are on the dashboard
      cy.url().should("include", "/dashboard");
      cy.get('[data-cy="dashboard-title"]').should("be.visible");
      cy.log(
        "Successfully logged in via cy.login() and navigated to dashboard."
      );
    });
  });

  it("should allow a logged-in user to add a voter and see the voter in the list", () => {
    // User is already logged in by beforeEach hook.

    // --- 3. Add a new Voter ---
    // Initially, the list should be empty
    cy.contains("No voters found").should("be.visible");

    // Click the button to open the "Create Voter" dialog
    cy.get('[data-cy="add-voter-button"]').click();
    cy.get('[data-cy="create-voter-dialog-title"]').should("be.visible");
    cy.log("Verified Add Voter dialog is open.");

    // Check initial state: Save Voter button should be disabled
    cy.get('[data-cy="create-voter-save-button"]').should("be.disabled");

    // Name field validation (required)
    cy.get('[data-cy="create-voter-name-input"]')
      .focus()
      .type("a")
      .clear()
      .blur(); // Type, clear, then blur
    cy.contains("Name is required.").should("be.visible");
    cy.get('[data-cy="create-voter-save-button"]').should("be.disabled");

    cy.get('[data-cy="create-voter-name-input"]').type(voterName);
    cy.contains("Name is required.").should("not.exist"); // Error should disappear
    // Button should be enabled now as 'name' is valid and 'email' (optional) is valid (empty or filled)
    cy.get('[data-cy="create-voter-save-button"]').should("be.enabled");

    // Fill optional fields
    cy.get('[data-cy="create-voter-email-input"]').type(voterEmail);
    cy.get('[data-cy="create-voter-notes-textarea"]').type(
      "This is a test note from Cypress."
    );

    // Save the new voter - button should still be enabled
    cy.get('[data-cy="create-voter-save-button"]').should("be.enabled").click();

    // Assert the dialog is gone and success toast appears
    cy.get('[data-cy="create-voter-dialog-title"]').should("not.exist");
    cy.get(
      '[data-sonner-toast]:contains("Voter created successfully!")'
    ).should("be.visible");
    cy.log("Successfully added a new voter and dialog closed.");

    // --- 4. Verify the new voter is in the list ---
    // The "No voters found" message should be gone
    cy.contains("No voters found").should("not.exist");

    // The new voter's details should be on the page
    cy.get('[data-cy="voters-table"]').should("contain", voterName);
    cy.get('[data-cy="voters-table"]').should("contain", voterEmail);
    cy.get('[data-cy="voters-table"]').should(
      "contain",
      "This is a test note from Cypress."
    );
  });
});
