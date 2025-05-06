import * as discordServer from "../fixtures/discord-server.json";
import * as discordServerUsers from "../fixtures/discord-server-users.json";

describe("servers", () => {
  before(() => {
    cy.resetDatabase();
    cy.resetMockApi();
    cy.login();
  });

  it("should display the servers", () => {
    cy.task("mockApiResponse", {
      path: "/users/@me/guilds",
      data: [discordServer],
    });

    cy.task("mockApiResponse", {
      path: "/guilds/1111111111111111111/members",
      data: discordServerUsers,
    });

    cy.visit("/");

    cy.contains("Servers updated successfully.").should("not.exist");
    cy.contains("TEST SERVER").should("not.exist");

    cy.contains("Refresh Server List").click();

    cy.contains("Servers updated successfully.").should("exist");
    cy.contains("TEST SERVER").should("exist");
  });
});
