import {
  CamelCasePlugin,
  Expression,
  Kysely,
  PostgresDialect,
  Selectable,
} from "kysely";
import {
  Channels,
  DB,
  Messages,
  MessagesAttachments,
  Servers,
  Users,
} from "./db";
import { Pool } from "pg";
import { parse } from "pg-connection-string";
import { config } from "@/config";
import { jsonArrayFrom } from "kysely/helpers/postgres";

export type User = Selectable<Users>;
export type Server = Selectable<Servers>;
export type Channel = Selectable<Channels>;
export type Message = Selectable<Messages>;
export type MessageAttachment = Selectable<MessagesAttachments>;

export type MessageWithDisplayData = Message & {
  authorUsername: string;
  attachments: MessageAttachment[];
};

export type Unsaved<T> = Omit<T, "id" | "createdAt" | "updatedAt">;

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

  async getUser(discordId: string): Promise<User | undefined> {
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

  async upsertUser(user: Unsaved<User>): Promise<User> {
    return this._db
      .with("inserted", (db) =>
        db
          .insertInto("users")
          .columns(["discordId", "discordUsername"])
          .values(user)
          .onConflict((oc) =>
            oc
              .column("discordId")
              .doUpdateSet({ discordUsername: user.discordUsername })
          )
          .returningAll()
      )
      .selectFrom("inserted")
      .selectAll()
      .union(
        this._db
          .selectFrom("users")
          .selectAll()
          .where("discordId", "=", user.discordId)
      )
      .executeTakeFirstOrThrow();
  }

  async upsertUsers(users: Unsaved<User>[]): Promise<User[]> {
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

  async upsertServer(server: Unsaved<Server>): Promise<Server> {
    return this._db
      .with("inserted", (db) =>
        db
          .insertInto("servers")
          .columns(["discordId", "name", "iconHash", "active"])
          .values(server)
          .onConflict((oc) =>
            oc.column("discordId").doUpdateSet({
              name: server.name,
              iconHash: server.iconHash,
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
          .where("discordId", "=", server.discordId)
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

  async getChannels({
    serverId,
    userId,
  }: {
    serverId: string;
    userId: string;
  }): Promise<Channel[]> {
    return this._db
      .selectFrom("channels")
      .selectAll("channels")
      .where("serverId", "=", serverId)
      .where(({ exists, selectFrom }) =>
        exists(
          selectFrom("messages")
            .select("id")
            .where(({ eb, ref }) =>
              eb("messages.channelId", "=", ref("channels.id")).and(
                eb("messages.authorId", "=", userId)
              )
            )
        )
      )
      .execute();
  }

  async upsertChannel(
    channel: Unsaved<Omit<Channel, "lastSyncedAt">>
  ): Promise<Channel | undefined> {
    return this._db
      .with("inserted", (db) =>
        db
          .insertInto("channels")
          .values(channel)
          .onConflict((oc) => oc.column("discordId").doNothing())
          .returningAll()
      )
      .selectFrom("inserted")
      .selectAll()
      .union(
        this._db
          .selectFrom("channels")
          .selectAll()
          .where("discordId", "=", channel.discordId)
      )
      .executeTakeFirstOrThrow();
  }

  async updateChannel(
    channelId: string,
    update: Partial<Unsaved<Channel>>
  ): Promise<void> {
    await this._db
      .updateTable("channels")
      .set(update)
      .where("id", "=", channelId)
      .execute();
  }

  async getMessage(messageId: string): Promise<Message | undefined> {
    return this._db
      .selectFrom("messages")
      .selectAll()
      .where("id", "=", messageId)
      .executeTakeFirst();
  }

  async getRecentMessages(
    channelId: string,
    {
      limit,
      offset,
    }: {
      limit: number;
      offset: number;
    }
  ): Promise<MessageWithDisplayData[]> {
    return this._db
      .with("reversed", (db) =>
        db
          .selectFrom("messages")
          .selectAll("messages")
          .innerJoin("users", "messages.authorId", "users.id")
          .select(["users.discordUsername as authorUsername"])
          .select(({ ref }) => [
            this._messageAttachments(ref("messages.id")).as("attachments"),
          ])
          .where((eb) =>
            eb("channelId", "=", channelId).and("threadId", "is", null)
          )
          .orderBy("discordPublishedAt desc")
          .limit(limit)
          .offset(offset)
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
      .where((eb) =>
        eb("messages.channelId", "=", channelId).and(
          "messages.threadId",
          "is",
          null
        )
      )
      .orderBy("discordPublishedAt asc")
      .limit(1)
      .executeTakeFirst();
  }

  async getThreadOriginMessages(channelId: string): Promise<Message[]> {
    return this._db
      .selectFrom("messages")
      .selectAll("messages")
      .where((eb) => eb("channelId", "=", channelId).and("isThread", "=", true))
      .execute();
  }

  async getThreadMessages(
    parentMessageId: string
  ): Promise<MessageWithDisplayData[]> {
    return this._db
      .selectFrom("messages")
      .selectAll("messages")
      .innerJoin("users", "messages.authorId", "users.id")
      .select(["users.discordUsername as authorUsername"])
      .select(({ ref }) => [
        this._messageAttachments(ref("messages.id")).as("attachments"),
      ])
      .where("threadId", "=", parentMessageId)
      .orderBy("discordPublishedAt", "asc")
      .execute();
  }

  async getOldestThreadMessage(threadId: string): Promise<Message | undefined> {
    return this._db
      .selectFrom("messages")
      .selectAll()
      .where("threadId", "=", threadId)
      .orderBy("discordPublishedAt", "asc")
      .limit(1)
      .executeTakeFirst();
  }

  async getUnsyncedMessages(channelId: string) {
    return this._db
      .selectFrom("messages")
      .selectAll("messages")
      .where(({ eb, and }) =>
        and([eb("channelId", "=", channelId), eb("lastSyncedAt", "is", null)])
      )
      .execute();
  }

  async getMessagesWithUnsyncedAttachments(channelId: string) {
    return this._db
      .selectFrom("messages")
      .selectAll("messages")
      .select(({ ref }) => [
        this._messageAttachments(ref("messages.id")).as("attachments"),
      ])
      .where(({ exists, selectFrom }) =>
        exists(
          selectFrom("messagesAttachments")
            .selectAll("messagesAttachments")
            .where(({ eb, ref }) =>
              eb("messages.id", "=", ref("messagesAttachments.messageId")).and(
                "messagesAttachments.storagePath",
                "is",
                null
              )
            )
        )
      )
      .where("channelId", "=", channelId)
      .execute();
  }

  async upsertMessages(messages: Unsaved<Message>[]): Promise<Message[]> {
    if (!messages.length) {
      return [];
    }

    return this._db
      .insertInto("messages")
      .values(messages)
      .returningAll()
      .onConflict((oc) =>
        oc
          .column("discordId")
          .doUpdateSet({ content: (eb) => eb.ref("excluded.content") })
      )
      .execute();
  }

  async updateMessage(
    messageId: string,
    update: Partial<Unsaved<Message>>
  ): Promise<void> {
    await this._db
      .updateTable("messages")
      .set(update)
      .where("id", "=", messageId)
      .execute();
  }

  async getAttachment(
    attachmentId: string
  ): Promise<MessageAttachment | undefined> {
    return this._db
      .selectFrom("messagesAttachments")
      .selectAll("messagesAttachments")
      .where("id", "=", attachmentId)
      .executeTakeFirst();
  }

  async getChannelAttachments(channelId: string): Promise<MessageAttachment[]> {
    return this._db
      .selectFrom("messagesAttachments")
      .innerJoin("messages", "messagesAttachments.messageId", "messages.id")
      .selectAll("messagesAttachments")
      .where("channelId", "=", channelId)
      .orderBy("messages.discordPublishedAt", "desc")
      .execute();
  }

  async updateAttachment(
    attachmentId: string,
    update: Partial<Unsaved<MessageAttachment>>
  ): Promise<void> {
    await this._db
      .updateTable("messagesAttachments")
      .set(update)
      .where("id", "=", attachmentId)
      .execute();
  }

  async upsertMessagesAttachments(
    messagesAttachments: Unsaved<MessageAttachment>[]
  ): Promise<MessageAttachment[]> {
    if (!messagesAttachments.length) {
      return [];
    }

    return this._db
      .insertInto("messagesAttachments")
      .values(messagesAttachments)
      .returningAll()
      .onConflict((oc) =>
        oc.column("discordId").doUpdateSet({
          storagePath: (eb) => eb.ref("excluded.storagePath"),
        })
      )
      .execute();
  }

  _messageAttachments(messageId: Expression<string>) {
    return jsonArrayFrom(
      this._db
        .selectFrom("messagesAttachments")
        .selectAll("messagesAttachments")
        .where("messagesAttachments.messageId", "=", messageId)
    );
  }
}

const database = Object.freeze(
  new DatabaseClient({
    connectionString: config.databaseUrl,
    cert: config.databaseCert,
  })
);

export default database;
