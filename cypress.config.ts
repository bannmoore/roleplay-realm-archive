import { defineConfig } from "cypress";
import dotenv from "dotenv";
import path from "path";
import { e2eNodeEvents } from "./cypress/support/setupNodeEvents";

const envLocal = dotenv.config({
  path: path.resolve(process.cwd(), ".env.local"),
});

export default defineConfig({
  e2e: {
    setupNodeEvents: e2eNodeEvents,
    baseUrl: envLocal.parsed?.BASE_URL,
    env: {
      DISCORD_API_URL: "http://localhost:9000",
      CYPRESS_USERNAME: envLocal.parsed?.CYPRESS_USERNAME,
      CYPRESS_PASSWORD: envLocal.parsed?.CYPRESS_PASSWORD,
      CYPRESS_DISCORD_ID: envLocal.parsed?.CYPRESS_DISCORD_ID,
      CYPRESS_DISCORD_USERNAME: envLocal.parsed?.CYPRESS_DISCORD_USERNAME,
    },
    experimentalInteractiveRunEvents: true,
  },
});
