import { Kysely, PostgresDialect, Selectable } from "kysely";
import { DB, Servers } from "kysely-codegen";
import { Pool } from "pg";
import { DiscordChannel, DiscordUser } from "./discord-types";
import { MessageWithUser } from "@/app/servers/[id]/actions";
import { parse } from "pg-connection-string";
import { config } from "@/config";

class DatabaseClient {
  private _db: Kysely<DB>;

  constructor({
    connectionString,
    cert,
  }: {
    connectionString: string;
    cert: string;
  }) {
    const dbConfig = parse(connectionString);
    this._db = new Kysely<DB>({
      dialect: new PostgresDialect({
        pool: new Pool({
          // I'd like to use connectionString directly, but there seems to be an
          // underlying issue in node-postgres that prevents it from playing
          // nice with ssl certs:
          // https://github.com/brianc/node-postgres/pull/2709
          database: dbConfig.database || "",
          host: dbConfig.host || "",
          user: dbConfig.user,
          password: dbConfig.password,
          port: Number(dbConfig.port || "5432"),
          ssl: dbConfig.ssl
            ? {
                rejectUnauthorized: true,
                ca: cert,
              }
            : undefined,
        }),
      }),
    });
  }

  async getCurrentUser(token: string) {
    return this._db
      .selectFrom("users")
      .innerJoin("sessions", "sessions.user_id", "users.id")
      .where("sessions.token", "=", token)
      .selectAll()
      .executeTakeFirstOrThrow();
  }

  async upsertUser({
    discordId,
    discordUsername,
  }: {
    discordId: string;
    discordUsername: string;
  }) {
    return this._db
      .insertInto("users")
      .columns(["discord_id", "discord_username"])
      .values({
        discord_id: discordId,
        discord_username: discordUsername,
      })
      .returning("id")
      .onConflict((oc) =>
        oc
          .column("discord_id")
          .doUpdateSet({ discord_username: discordUsername })
      )
      .executeTakeFirstOrThrow();
  }

  async upsertUsers(users: DiscordUser[]) {
    const ids = users.map((user) => user.id);

    return this._db
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
      .union(this._db.selectFrom("users").selectAll().where("id", "in", ids))
      .execute();
  }

  async upsertSession({
    userId,
    token,
    expiresAt,
  }: {
    userId: string;
    token: string;
    expiresAt: Date;
  }) {
    return this._db
      .insertInto("sessions")
      .columns(["user_id", "token", "expires_at"])
      .values({
        user_id: userId,
        token,
        expires_at: expiresAt,
      })
      .onConflict((oc) =>
        oc
          .column("user_id")
          .doUpdateSet({ token: token, expires_at: expiresAt })
      )
      .executeTakeFirstOrThrow();
  }

  async getServer(id: string) {
    return this._db
      .selectFrom("servers")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();
  }

  async getServers(): Promise<Selectable<Servers>[]> {
    return this._db.selectFrom("servers").selectAll().execute();
  }

  async deactivateServers() {
    return this._db
      .updateTable("servers")
      .set({
        active: false,
      })
      .execute();
  }

  async upsertServer({
    discordId,
    name,
    iconHash,
  }: {
    discordId: string;
    name: string;
    iconHash: string;
  }) {
    return this._db
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

  async getChannel(channelId: string) {
    return this._db
      .selectFrom("channels")
      .selectAll()
      .where("id", "=", channelId)
      .executeTakeFirst();
  }

  async getChannels(serverId: string) {
    return this._db
      .selectFrom("channels")
      .selectAll()
      .where("server_id", "=", serverId)
      .execute();
  }

  async upsertChannel(serverId: string, channel: DiscordChannel) {
    return this._db
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
      .union(this._db.selectFrom("channels").selectAll())
      .executeTakeFirst();
  }

  async getMessages(channelId: string) {
    return this._db
      .selectFrom("messages")
      .innerJoin("users", "messages.author_id", "users.id")
      .selectAll("messages")
      .select(["users.discord_username"])
      .where("channel_id", "=", channelId)
      .orderBy("discord_published_at asc")
      .limit(10)
      .execute();
  }

  async upsertMessages(channelId: string, messages: MessageWithUser[]) {
    return this._db
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
}

const database = Object.freeze(
  new DatabaseClient({
    connectionString: config.databaseUrl,
    cert: config.databaseCert,
  })
);

export default database;
