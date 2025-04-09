import { CamelCasePlugin, Kysely, PostgresDialect, Selectable } from "kysely";
import { Channels, DB, Messages, Servers, Users } from "./db";
import { Pool } from "pg";
import { parse } from "pg-connection-string";
import { config } from "@/config";

export type User = Selectable<Users>;
export type Server = Selectable<Servers>;
export type Channel = Selectable<Channels>;
export type Message = Selectable<Messages>;

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
      // Needed because we're using kysely-codgen configuration: "camelCase: true"
      plugins: [new CamelCasePlugin()],
    });
  }

  async getCurrentUser(discordId: string): Promise<User | undefined> {
    return this._db
      .selectFrom("users")
      .where("discordId", "=", discordId)
      .selectAll("users")
      .executeTakeFirst();
  }

  async getUsers(discordIds: string[]): Promise<User[]> {
    return this._db
      .selectFrom("users")
      .selectAll()
      .where("discordId", "in", discordIds)
      .execute();
  }

  async getServerUsers(serverId: string): Promise<User[]> {
    return this._db
      .selectFrom("users")
      .selectAll("users")
      .innerJoin("serversUsers", "serversUsers.userId", "users.id")
      .where("serversUsers.serverId", "=", serverId)
      .execute();
  }

  async upsertUser({
    discordId,
    discordUsername,
  }: {
    discordId: string;
    discordUsername: string;
  }): Promise<User> {
    return this._db
      .with("inserted", (db) =>
        db
          .insertInto("users")
          .columns(["discordId", "discordUsername"])
          .values({
            discordId,
            discordUsername,
          })
          .onConflict((oc) =>
            oc.column("discordId").doUpdateSet({ discordUsername })
          )
          .returningAll()
      )
      .selectFrom("inserted")
      .selectAll()
      .union(
        this._db
          .selectFrom("users")
          .selectAll()
          .where("discordId", "=", discordId)
      )
      .executeTakeFirstOrThrow();
  }

  async upsertUsers(
    users: {
      discordId: string;
      discordUsername: string;
    }[]
  ): Promise<User[]> {
    const ids = users.map((user) => user.discordId);

    return this._db
      .with("inserted", (db) =>
        db
          .insertInto("users")
          .values(
            users.map((user) => ({
              discordId: user.discordId,
              discordUsername: user.discordUsername,
            }))
          )
          .onConflict((oc) =>
            oc.column("discordId").doUpdateSet({
              discordUsername: (eb) => eb.ref("excluded.discordUsername"),
            })
          )
          .returningAll()
      )
      .selectFrom("inserted")
      .selectAll()
      .union(this._db.selectFrom("users").selectAll().where("id", "in", ids))
      .execute();
  }

  async getServer(id: string): Promise<Server | undefined> {
    return this._db
      .selectFrom("servers")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();
  }

  async getServers(userId: string): Promise<Server[]> {
    return this._db
      .selectFrom("servers")
      .selectAll("servers")
      .innerJoin("serversUsers", "serversUsers.serverId", "servers.id")
      .where("serversUsers.userId", "=", userId)
      .where((eb) =>
        eb("serversUsers.userId", "=", userId).and("servers.active", "=", true)
      )
      .execute();
  }

  async deactivateServers(): Promise<void> {
    await this._db
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
    iconHash?: string;
  }): Promise<Server> {
    return this._db
      .with("inserted", (db) =>
        db
          .insertInto("servers")
          .columns(["discordId", "name", "iconHash", "active"])
          .values({
            discordId,
            name,
            iconHash,
            active: true,
          })
          .onConflict((oc) =>
            oc.column("discordId").doUpdateSet({
              name,
              iconHash,
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
          .where("discordId", "=", discordId)
      )
      .executeTakeFirstOrThrow();
  }

  async upsertServersUsers(serverId: string, users: User[]): Promise<void> {
    await this._db
      .insertInto("serversUsers")
      .values(
        users.map((user) => ({
          userId: user.id,
          serverId: serverId,
        }))
      )
      .onConflict((oc) =>
        oc.constraint("serversUsers_userId_serverId_key").doNothing()
      )
      .execute();
  }

  async deleteServersUsers(): Promise<void> {
    await this._db.deleteFrom("serversUsers").execute();
  }

  async getChannel(channelId: string) {
    return this._db
      .selectFrom("channels")
      .selectAll()
      .where("id", "=", channelId)
      .executeTakeFirst();
  }

  async getChannels(serverId: string): Promise<Channel[]> {
    return this._db
      .selectFrom("channels")
      .selectAll()
      .where("serverId", "=", serverId)
      .execute();
  }

  async upsertChannel(
    serverId: string,
    channel: {
      discordId: string;
      name: string;
    }
  ): Promise<Channel | undefined> {
    return this._db
      .with("inserted", (db) =>
        db
          .insertInto("channels")
          .values({
            discordId: channel.discordId,
            serverId: serverId,
            name: channel.name,
            active: true,
          })
          .onConflict((oc) => oc.column("discordId").doNothing())
          .returningAll()
      )
      .selectFrom("inserted")
      .selectAll()
      .union(this._db.selectFrom("channels").selectAll())
      .where("discordId", "=", channel.discordId)
      .executeTakeFirstOrThrow();
  }

  async getRecentMessages(channelId: string): Promise<Message[]> {
    return this._db
      .with("reversed", (db) =>
        db
          .selectFrom("messages")
          .selectAll("messages")
          .where("channelId", "=", channelId)
          .orderBy("discordPublishedAt desc")
          .limit(2)
      )
      .selectFrom("reversed")
      .selectAll()
      .orderBy("discordPublishedAt asc")
      .execute();
  }

  async getOldestMessage(channelId: string): Promise<Message | undefined> {
    return this._db
      .selectFrom("messages")
      .innerJoin("users", "messages.authorId", "users.id")
      .selectAll("messages")
      .select(["users.discordUsername"])
      .where("channelId", "=", channelId)
      .orderBy("discordPublishedAt asc")
      .limit(1)
      .executeTakeFirst();
  }

  async upsertMessages(
    channelId: string,
    messages: {
      discordId: string;
      authorId: string;
      content: string;
      discordPublishedAt: Date;
    }[]
  ): Promise<Message[]> {
    return this._db
      .insertInto("messages")
      .values(
        messages.map((message) => ({
          discordId: message.discordId,
          channelId: channelId,
          authorId: message.authorId,
          content: message.content,
          discordPublishedAt: message.discordPublishedAt,
        }))
      )
      .returningAll()
      .onConflict((oc) =>
        oc
          .column("discordId")
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
