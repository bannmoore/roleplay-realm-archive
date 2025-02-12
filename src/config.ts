export const config = {
  baseUrl: process.env.BASE_URL || "",
  databaseUrl: process.env.DATABASE_URL || "",
  databaseCert: process.env.DATABASE_CERT || "",
  discordBotToken: process.env.DISCORD_BOT_TOKEN || "",
  discordClientId: process.env.DISCORD_CLIENT_ID || "",
  discordClientSecret: process.env.DISCORD_CLIENT_SECRET || "",
  discordState: process.env.DISCORD_STATE || "",
  env: process.env.NODE_ENV || "dev",
};
