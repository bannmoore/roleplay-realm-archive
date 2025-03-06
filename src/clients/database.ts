import { Kysely, PostgresDialect } from "kysely";
import { DB } from "kysely-codegen";
import { Pool } from "pg";
import { parse } from "pg-connection-string";
import { config } from "@/config";
import { UnsavedUser, User, userFromDbRow } from "@/dtos/user";
import { Server, serverFromDbRow, UnsavedServer } from "@/dtos/server";
import { Channel, channelFromDbRow, UnsavedChannel } from "@/dtos/channel";
import { Message, messageFromDbRow, UnsavedMessage } from "@/dtos/message";

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

  async getCurrentUser(discordId: string): Promise<User | undefined> {
    const row = await this._db
      .selectFrom("users")
      .where("discord_id", "=", discordId)
      .selectAll()
      .executeTakeFirst();

    return row ? userFromDbRow(row) : row;
  }

  async getUsers(discordIds: string[]): Promise<User[]> {
    const rows = await this._db
      .selectFrom("users")
      .selectAll()
      .where("discord_id", "in", discordIds)
      .execute();

    return rows.map(userFromDbRow);
  }

  async getServerUsers(serverId: string): Promise<User[]> {
    const rows = await this._db
      .selectFrom("users")
      .selectAll("users")
      .innerJoin("servers_users", "servers_users.user_id", "users.id")
      .where("servers_users.server_id", "=", serverId)
      .execute();

    return rows.map(userFromDbRow);
  }

  async upsertUser(user: UnsavedUser): Promise<User> {
    const inserted = await this._db
      .with("inserted", (db) =>
        db
          .insertInto("users")
          .columns(["discord_id", "discord_username"])
          .values({
            discord_id: user.discordId,
            discord_username: user.discordUsername,
          })
          .onConflict((oc) =>
            oc
              .column("discord_id")
              .doUpdateSet({ discord_username: user.discordUsername })
          )
          .returningAll()
      )
      .selectFrom("inserted")
      .selectAll()
      .union(
        this._db
          .selectFrom("users")
          .selectAll()
          .where("discord_id", "=", user.discordId)
      )
      .executeTakeFirstOrThrow();

    return userFromDbRow(inserted);
  }

  async upsertUsers(users: UnsavedUser[]): Promise<User[]> {
    const ids = users.map((user) => user.discordId);

    const inserted = await this._db
      .with("inserted", (db) =>
        db
          .insertInto("users")
          .values(
            users.map((user) => ({
              discord_id: user.discordId,
              discord_username: user.discordUsername,
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

    return inserted.map(userFromDbRow);
  }

  async getServer(id: string): Promise<Server | undefined> {
    const row = await this._db
      .selectFrom("servers")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();

    return row ? serverFromDbRow(row) : row;
  }

  async getServers(userId: string): Promise<Server[]> {
    const rows = await this._db
      .selectFrom("servers")
      .selectAll("servers")
      .innerJoin("servers_users", "servers_users.server_id", "servers.id")
      .where("servers_users.user_id", "=", userId)
      .where((eb) =>
        eb("servers_users.user_id", "=", userId).and(
          "servers.active",
          "=",
          true
        )
      )
      .execute();

    return rows.map(serverFromDbRow);
  }

  async deactivateServers(): Promise<void> {
    await this._db
      .updateTable("servers")
      .set({
        active: false,
      })
      .execute();
  }

  async upsertServer(server: UnsavedServer): Promise<Server> {
    const inserted = await this._db
      .with("inserted", (db) =>
        db
          .insertInto("servers")
          .columns(["discord_id", "name", "icon_hash", "active"])
          .values({
            discord_id: server.discordId,
            name: server.name,
            icon_hash: server.iconHash,
            active: true,
          })
          .onConflict((oc) =>
            oc.column("discord_id").doUpdateSet({
              name: server.name,
              icon_hash: server.iconHash,
              active: true,
            })
          )
          .returningAll()
      )
      .selectFrom("inserted")
      .selectAll()
      .union(
        this._db
          .selectFrom("servers")
          .selectAll()
          .where("discord_id", "=", server.discordId)
      )
      .executeTakeFirstOrThrow();

    return serverFromDbRow(inserted);
  }

  async upsertServersUsers(serverId: string, users: User[]): Promise<void> {
    await this._db
      .insertInto("servers_users")
      .values(
        users.map((user) => ({
          user_id: user.id,
          server_id: serverId,
        }))
      )
      .onConflict((oc) =>
        oc.constraint("servers_users_user_id_server_id_key").doNothing()
      )
      .execute();
  }

  async deleteServersUsers(): Promise<void> {
    await this._db.deleteFrom("servers_users").execute();
  }

  async getChannel(channelId: string) {
    return this._db
      .selectFrom("channels")
      .selectAll()
      .where("id", "=", channelId)
      .executeTakeFirst();
  }

  /*
  WITH channel_messages AS (
    SELECT *
    FROM messages
    WHERE channel_id = 5
  )
  SELECT
    channels.*,
    (SELECT COUNT(*) FROM channel_messages) AS total_messages,
    (SELECT discord_published_at FROM channel_messages ORDER BY discord_published_at ASC LIMIT 1) AS first_message_at,
    (SELECT discord_published_at FROM channel_messages ORDER BY discord_published_at DESC LIMIT 1) AS last_message_at
  FROM channels
  WHERE id = 5;
  */
  async getChannelWithMetadata(
    channelId: string
  ): Promise<Channel | undefined> {
    const row = await this._db
      .with("channel_messages", (db) =>
        db
          .selectFrom("messages")
          .selectAll()
          .where("channel_id", "=", channelId)
      )
      .selectFrom("channels")
      .selectAll()
      .select(({ selectFrom, fn }) => [
        selectFrom("channel_messages")
          .select(fn.countAll().as("count"))
          .as("total_messages"),
        selectFrom("channel_messages")
          .select("discord_published_at")
          .orderBy("discord_published_at", "asc")
          .limit(1)
          .as("first_message_at"),
        selectFrom("channel_messages")
          .select("discord_published_at")
          .orderBy("discord_published_at", "desc")
          .limit(1)
          .as("last_message_at"),
      ])
      .where("id", "=", channelId)
      .executeTakeFirst();

    if (!row) {
      return row;
    }

    return {
      ...channelFromDbRow(row),
      totalMessages: Number(row.total_messages),
      firstMessageAt: row.first_message_at || undefined,
      lastMessageAt: row.last_message_at || undefined,
    };
  }

  async getChannels(serverId: string): Promise<Channel[]> {
    const rows = await this._db
      .selectFrom("channels")
      .selectAll()
      .where("server_id", "=", serverId)
      .execute();

    return rows.map(channelFromDbRow);
  }

  async upsertChannel(
    serverId: string,
    channel: UnsavedChannel
  ): Promise<Channel | undefined> {
    const inserted = await this._db
      .with("inserted", (db) =>
        db
          .insertInto("channels")
          .values({
            discord_id: channel.discordId,
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
      .where("discord_id", "=", channel.discordId)
      .executeTakeFirstOrThrow();

    return channelFromDbRow(inserted);
  }

  async getRecentMessages(channelId: string): Promise<Message[]> {
    const rows = await this._db
      .with("reversed", (db) =>
        db
          .selectFrom("messages")
          .innerJoin("users", "messages.author_id", "users.id")
          .selectAll("messages")
          .select(["users.discord_username"])
          .where("channel_id", "=", channelId)
          .orderBy("discord_published_at desc")
          .limit(2)
      )
      .selectFrom("reversed")
      .selectAll()
      .orderBy("discord_published_at asc")
      .execute();

    return rows.map((row) => ({
      ...messageFromDbRow(row),
      authorUsername: row.discord_username || undefined,
    }));
  }

  async getOldestMessage(channelId: string): Promise<Message | undefined> {
    const row = await this._db
      .selectFrom("messages")
      .innerJoin("users", "messages.author_id", "users.id")
      .selectAll("messages")
      .select(["users.discord_username"])
      .where("channel_id", "=", channelId)
      .orderBy("discord_published_at asc")
      .limit(1)
      .executeTakeFirst();

    return row ? messageFromDbRow(row) : row;
  }

  async upsertMessages(
    channelId: string,
    messages: UnsavedMessage[]
  ): Promise<Message[]> {
    const rows = await this._db
      .insertInto("messages")
      .values(
        messages.map((message) => ({
          discord_id: message.discordId,
          channel_id: channelId,
          author_id: message.authorId,
          content: message.content,
          discord_published_at: message.discordPublishedAt,
        }))
      )
      .returningAll()
      .onConflict((oc) =>
        oc
          .column("discord_id")
          .doUpdateSet({ content: (eb) => eb.ref("excluded.content") })
      )
      .execute();

    return rows.map(messageFromDbRow);
  }
}

const database = Object.freeze(
  new DatabaseClient({
    connectionString: config.databaseUrl,
    cert: config.databaseCert,
  })
);

export default database;
