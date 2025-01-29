import { Kysely, PostgresDialect, Selectable } from "kysely";
import { DB, Servers } from "kysely-codegen";
import { Pool } from "pg";
import { DiscordChannel, DiscordUser } from "./discord";
import { MessageWithUser } from "@/app/servers/[id]/actions";

const db = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: process.env.DATABASE_URL,
    }),
  }),
});

export function getCurrentUser(token: string) {
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

export function upsertUsers(users: DiscordUser[]) {
  const ids = users.map((user) => user.id);

  return db
    .with("inserted", (db) =>
      db
        .insertInto("users")
        .values(
          users.map((user) => ({
            discord_id: user.id,
            discord_username: user.username,
          }))
        )
        .onConflict((oc) =>
          oc.column("discord_id").doUpdateSet({
            discord_username: (eb) => eb.ref("excluded.discord_username"),
          })
        )
        .returningAll()
    )
    .selectFrom("inserted")
    .selectAll()
    .union(db.selectFrom("users").selectAll().where("id", "in", ids))
    .execute();
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

export function getServer(id: string) {
  return db
    .selectFrom("servers")
    .selectAll()
    .where("id", "=", id)
    .executeTakeFirst();
}

export function getServers(): Promise<Selectable<Servers>[]> {
  return db.selectFrom("servers").selectAll().execute();
}

export function deactivateServers() {
  return db
    .updateTable("servers")
    .set({
      active: false,
    })
    .execute();
}

export function upsertServer({
  discordId,
  name,
  iconHash,
}: {
  discordId: string;
  name: string;
  iconHash: string;
}) {
  return db
    .insertInto("servers")
    .columns(["discord_id", "name", "icon_hash", "active"])
    .values({
      discord_id: discordId,
      name,
      icon_hash: iconHash,
      active: true,
    })
    .onConflict((oc) =>
      oc
        .column("discord_id")
        .doUpdateSet({ name: name, icon_hash: iconHash, active: true })
    )
    .executeTakeFirstOrThrow();
}

export function getChannels(serverId: string) {
  return db
    .selectFrom("channels")
    .selectAll()
    .where("server_id", "=", serverId)
    .execute();
}

export function upsertChannel(serverId: string, channel: DiscordChannel) {
  return db
    .with("inserted", (db) =>
      db
        .insertInto("channels")
        .values({
          discord_id: channel.id,
          server_id: serverId,
          name: channel.name,
          active: true,
        })
        .onConflict((oc) => oc.column("discord_id").doNothing())
        .returningAll()
    )
    .selectFrom("inserted")
    .selectAll()
    .union(db.selectFrom("channels").selectAll())
    .executeTakeFirst();
}

export function getMessages(channelId: string) {
  return db
    .selectFrom("messages")
    .selectAll()
    .where("channel_id", "=", channelId)
    .execute();
}

export function upsertMessages(channelId: string, messages: MessageWithUser[]) {
  return db
    .insertInto("messages")
    .values(
      messages.map((message) => ({
        discord_id: message.id,
        channel_id: channelId,
        author_id: message.author_user?.id,
        content: message.content,
        discord_published_at: new Date(message.timestamp),
      }))
    )
    .onConflict((oc) =>
      oc
        .column("discord_id")
        .doUpdateSet({ content: (eb) => eb.ref("excluded.content") })
    )
    .execute();
}
