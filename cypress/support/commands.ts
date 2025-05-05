/// <reference types="cypress" />

Cypress.Commands.add("createTestUser", () => {
  cy.task(
    "queryDb",
    `INSERT INTO users (discord_id, discord_username)
     VALUES ('1234abcd', 'test_user')
     ON CONFLICT (discord_id) DO NOTHING`
  );
});

Cypress.Commands.add("logout", () => {
  cy.visit("/");

  cy.contains("Sign Out").click();
});

Cypress.Commands.add("login", () => {
  cy.visit("/api/nextauth/signin");

  cy.get('input[name="username"]').type(Cypress.env("CYPRESS_USERNAME"));
  cy.get('input[name="password"]').type(Cypress.env("CYPRESS_PASSWORD"));
  cy.get('button[type="submit"][id="submitButton"]').click();
});
