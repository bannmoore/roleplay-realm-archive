import { defineConfig } from "cypress";
import { Client } from "pg";
import dotenv from "dotenv";
import path from "path";

const envLocal = dotenv.config({
  path: path.resolve(process.cwd(), ".env.local"),
});

const pgConfig = {
  user: "postgres",
  password: "password",
  host: "localhost",
  database: "postgres",
  ssl: false,
  port: 5432,
};

export default defineConfig({
  e2e: {
    setupNodeEvents(on, _config) {
      on("task", {
        // Task allowing direct queries to postgres.
        async queryDb(queryString) {
          const client = new Client(pgConfig);
          await client.connect();
          const res = await client.query(queryString);
          await client.end();
          return res.rows;
        },
      });
    },
    baseUrl: envLocal.parsed?.BASE_URL,
    env: {
      CYPRESS_USERNAME: envLocal.parsed?.CYPRESS_USERNAME,
      CYPRESS_PASSWORD: envLocal.parsed?.CYPRESS_PASSWORD,
    },
  },
});
