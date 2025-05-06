import MockApiServer from "./mockApiServer";
import { Client } from "pg";

const pgConfig = {
  user: "postgres",
  password: "password",
  host: "localhost",
  database: "postgres",
  ssl: false,
  port: 5432,
};

// https://github.com/cypress-io/cypress/discussions/28469#discussioncomment-11252527
export const e2eNodeEvents: Cypress.Config["e2e"]["setupNodeEvents"] = (on) => {
  const mockApiServer = new MockApiServer();

  on("before:run", () => {
    console.debug("Starting mock API server");
    mockApiServer.start();
  });

  on("after:run", () => {
    console.debug("Stopping mock API server");
    mockApiServer.stop();
  });

  on("task", {
    mockApiResponse({ path, data }) {
      mockApiServer.mockGetResponse({ path, data });
      return null;
    },

    resetApiMocks() {
      mockApiServer.reset();
      return null;
    },

    // Task allowing direct queries to postgres.
    async queryDb(queryString) {
      const client = new Client(pgConfig);
      await client.connect();
      const res = await client.query(queryString);
      await client.end();
      return res.rows;
    },
  });
};
