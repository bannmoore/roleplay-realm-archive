describe("auth", () => {
  it("should login", () => {
    cy.login();

    cy.location("pathname").should("eq", "/");
    cy.contains("Sign Out").should("exist");
  });

  it("should logout", () => {
    cy.login();
    cy.logout();

    cy.location("pathname").should("eq", "/");
    cy.contains("Sign Out").should("not.exist");
    cy.contains("Please sign in").should("exist");
  });
});
