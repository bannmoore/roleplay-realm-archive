import { Kysely, PostgresDialect } from "kysely";
import { DB } from "kysely-codegen";
import { Pool } from "pg";

const db = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: process.env.DATABASE_URL,
    }),
  }),
});

export function getMe(token: string) {
  return db
    .selectFrom("users")
    .innerJoin("sessions", "sessions.user_id", "users.id")
    .where("sessions.token", "=", token)
    .selectAll()
    .executeTakeFirstOrThrow();
}

export function upsertUser({
  discordId,
  discordUsername,
}: {
  discordId: string;
  discordUsername: string;
}) {
  return db
    .insertInto("users")
    .columns(["discord_id", "discord_username"])
    .values({
      discord_id: discordId,
      discord_username: discordUsername,
    })
    .returning("id")
    .onConflict((oc) =>
      oc.column("discord_id").doUpdateSet({ discord_username: discordUsername })
    )
    .executeTakeFirstOrThrow();
}

export function upsertSession({
  userId,
  token,
  expiresAt,
}: {
  userId: string;
  token: string;
  expiresAt: Date;
}) {
  return db
    .insertInto("sessions")
    .columns(["user_id", "token", "expires_at"])
    .values({
      user_id: userId,
      token,
      expires_at: expiresAt,
    })
    .onConflict((oc) =>
      oc.column("user_id").doUpdateSet({ token: token, expires_at: expiresAt })
    )
    .executeTakeFirstOrThrow();
}
