/// <reference types="cypress" />

describe("Registration Form Validation", () => {
  beforeEach(() => {
    cy.visit("/register");
  });

  it("should initially have a disabled submit button and validate fields on blur", () => {
    // Check initial state: button disabled
    cy.contains("button", "Create Account").should("be.disabled");

    // Name field validation
    cy.get('input[name="name"]').type("J").blur(); // Min 2 chars, so 'J' is invalid by current zod
    cy.contains("Name must be at least 2 characters.").should("be.visible");
    cy.contains("button", "Create Account").should("be.disabled");
    cy.get('input[name="name"]').clear().type("John Doe").blur();
    cy.contains("Name must be at least 2 characters.").should("not.exist");

    // Email field validation
    cy.get('input[name="email"]').type("invalid-email").blur();
    cy.contains("Invalid email address.").should("be.visible");
    cy.contains("button", "Create Account").should("be.disabled");
    cy.get('input[name="email"]').clear().type("valid@example.com").blur();
    cy.contains("Invalid email address.").should("not.exist");

    // Password field validation (min 8 characters)
    cy.get('input[name="password"]').type("short").blur();
    cy.contains("Password must be at least 8 characters.").should("be.visible");
    cy.contains("button", "Create Account").should("be.disabled");
    cy.get('input[name="password"]').clear().type("password123").blur();
    cy.contains("Password must be at least 8 characters.").should("not.exist");

    // All fields valid, button should be enabled
    cy.contains("button", "Create Account").should("be.enabled");

    // Make a field invalid again
    cy.get('input[name="password"]').clear().type("short").blur();
    cy.contains("Password must be at least 8 characters.").should("be.visible");
    cy.contains("button", "Create Account").should("be.disabled");
  });

  // You could add another 'it' block for successful submission after valid input
  // but the Full Canvasser Workflow already covers successful registration.
});

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
    cy.log(`Initial userEmail for test run: ${userEmail}`);
    // --- 1. Registration ---
    cy.visit("/register");
    cy.log(
      `Attempting to register with Name: ${userName}, Email: ${userEmail}, Password: ${userPassword}`
    );

    cy.contains("[class*='text-2xl']", "Sign Up").should("be.visible"); // Target by class on CardTitle

    cy.get('input[name="name"]').type(userName);
    cy.get('input[name="email"]').type(userEmail);
    cy.get('input[name="password"]').type(userPassword).blur(); // Added .blur() here

    // Ensure the button is enabled before clicking
    cy.contains('button[type="submit"]', "Create Account")
      .should("be.enabled")
      .click();

    // Assert we are redirected to the login page
    cy.url().should("include", "/login");
    cy.log("Successfully navigated to login page after registration attempt.");

    // --- 2. Login ---
    cy.log(
      `Attempting to log in with Email: ${userEmail}, Password: ${userPassword}`
    );
    cy.contains("[class*='text-2xl']", "Login").should("be.visible"); // Target by class on CardTitle, corrected text

    cy.get('input[name="email"]').type(userEmail);
    cy.get('input[name="password"]').type(userPassword);
    cy.contains('button[type="submit"]', "Sign In")
      .should("be.enabled")
      .click();

    // Assert we are redirected to the dashboard
    cy.url().should("include", "/dashboard");
    cy.log("Successfully logged in and navigated to dashboard.");

    // --- 3. Add a new Voter ---
    // Initially, the list should be empty
    cy.contains("No voters found").should("be.visible");

    // Click the button to open the "Create Voter" dialog
    cy.contains("button", "Add Voter").click();
    cy.contains("h2", "Create New Voter").should("be.visible");
    cy.log("Verified Add Voter dialog is open.");

    // Check initial state: Save Voter button should be disabled
    cy.contains('button', 'Save Voter').should('be.disabled');

    // Name field validation (required)
    cy.get('input[placeholder="Voter\'s full name"]').focus().type('a').clear().blur(); // Type, clear, then blur
    cy.contains('Name is required.').should('be.visible');
    cy.contains('button', 'Save Voter').should('be.disabled');

    cy.get('input[placeholder="Voter\'s full name"]').type(voterName);
    cy.contains('Name is required.').should('not.exist'); // Error should disappear
    // Button should be enabled now as 'name' is valid and 'email' (optional) is valid (empty or filled)
    cy.contains('button', 'Save Voter').should('be.enabled');

    // Fill optional fields
    cy.get('input[placeholder="voter@example.com"]').type(voterEmail);
    cy.get('textarea[placeholder="Any relevant notes..."]').type(
      "This is a test note from Cypress."
    );

    // Save the new voter - button should still be enabled
    cy.contains("button", "Save Voter").should("be.enabled").click();

    // Assert the dialog is gone and success toast appears
    cy.contains("h2", "Create New Voter").should("not.exist");
    cy.get('[data-sonner-toast]:contains("Voter created successfully!")').should('be.visible');
    cy.log("Successfully added a new voter and dialog closed.");

    // --- 4. Verify the new voter is in the list ---
    // The "No voters found" message should be gone
    cy.contains("No voters found").should("not.exist");

    // The new voter's details should be on the page
    cy.get("table").should("contain", voterName);
    cy.get("table").should("contain", voterEmail);
    cy.get("table").should("contain", "This is a test note from Cypress.");
  });
});
