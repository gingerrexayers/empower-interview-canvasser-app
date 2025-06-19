/// <reference types="cypress" />

Cypress.Commands.add("login", (email?: string, password?: string) => {
  const userEmail = email || `testuser_${Date.now()}@example.com`;
  const userName = `Test User ${Date.now()}`;
  const userPassword = password || "password123";
  // Ensure VITE_API_URL is configured in cypress.config.ts or as an environment variable
  const apiUrl = Cypress.env("VITE_API_URL") || "http://localhost:3001";

  cy.log(`Logging in as ${userEmail}`);

  // Attempt to register the user. If the user already exists, this might fail,
  // but the login step will confirm.
  cy.request({
    method: "POST",
    url: `${apiUrl}/auth/register`,
    body: {
      name: userName,
      email: userEmail,
      password: userPassword,
    },
    failOnStatusCode: false, // Don't fail if user already exists
  });

  // Log in to get the token
  return cy
    .request({
      method: "POST",
      url: `${apiUrl}/auth/login`,
      body: {
        email: userEmail,
        password: userPassword,
      },
    })
    .then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body).to.have.property("token");
      const token = response.body.token;

      cy.window().then((win) => {
        win.localStorage.setItem("authToken", token);
        cy.log("Auth token set in localStorage");
      });

      // Optionally return user details or token if needed by tests
      return cy.wrap({ token, email: userEmail, password: userPassword });
    });
});
