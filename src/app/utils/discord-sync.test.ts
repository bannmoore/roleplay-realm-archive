import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
import { when } from "vitest-when";
import database from "@/clients/database";
import discord from "@/clients/discord";
import { syncDiscordChannel } from "./discord-sync";
import { fakeArray } from "@/test/fakes";
import {
  fakeDiscordMessage,
  fakeDiscordUserFromDbUser,
} from "@/test/fakes/discord";
import { fakeChannel, fakeMessage, fakeUser } from "@/test/fakes/database";
import { faker } from "@faker-js/faker";

vi.mock("@/clients/database");
vi.mock("@/clients/discord");
vi.mock("next/cache");

describe("discord-sync", async () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers({
      shouldAdvanceTime: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("syncDiscordChannel", async () => {
    test("upserts nothing when there is no data", async () => {
      const fakeDate = faker.date.past();
      vi.setSystemTime(fakeDate);

      const channel = fakeChannel();

      when(database.getServerUsers)
        .calledWith(channel.serverId)
        .thenResolve([]);
      when(database.getOldestMessage)
        .calledWith(channel.id)
        .thenResolve(undefined);
      when(discord.getMessages)
        .calledWith(channel.discordId, { beforeId: undefined })
        .thenResolve([]);
      when(database.getThreads).calledWith(channel.id).thenResolve([]);

      await syncDiscordChannel(channel);

      expect(database.upsertMessages).not.toHaveBeenCalled();
      expect(database.updateChannel).toHaveBeenCalledWith(channel.id, {
        lastSyncedAt: fakeDate,
      });
    });

    test("upserts new messages", async () => {
      const fakeDate = faker.date.past();
      vi.setSystemTime(fakeDate);

      const channel = fakeChannel();

      const users = fakeArray(2, fakeUser);
      const messages = [
        fakeDiscordMessage({
          author: fakeDiscordUserFromDbUser(users[0]),
        }),
        fakeDiscordMessage({
          author: fakeDiscordUserFromDbUser(users[1]),
        }),
      ];

      when(database.getServerUsers)
        .calledWith(channel.serverId)
        .thenResolve(users);
      when(database.getOldestMessage)
        .calledWith(channel.id)
        .thenResolve(undefined);
      when(discord.getMessages)
        .calledWith(channel.discordId, { beforeId: undefined })
        .thenResolve(messages);
      when(discord.getMessages)
        .calledWith(channel.discordId, {
          beforeId: messages[messages.length - 1].id,
        })
        .thenResolve([]);

      when(database.upsertMessages)
        .calledWith([
          expect.objectContaining({
            discordId: messages[0].id,
          }),
          expect.objectContaining({
            discordId: messages[1].id,
          }),
        ])
        .thenResolve([
          fakeMessage({
            authorId: users[0].id,
            discordId: messages[0].id,
          }),
          fakeMessage({
            authorId: users[1].id,
            discordId: messages[1].id,
          }),
        ]);

      when(database.getThreads).calledWith(channel.id).thenResolve([]);

      await syncDiscordChannel(channel);

      expect(database.upsertMessages).toHaveBeenCalledTimes(1);

      expect(database.updateChannel).toHaveBeenCalledWith(channel.id, {
        lastSyncedAt: new Date(fakeDate.getTime() + 1000),
      });
    });

    test("upserts multiple loops of new messages", async () => {
      const fakeDate = faker.date.past();
      vi.setSystemTime(fakeDate);

      const channel = fakeChannel();

      const users = fakeArray(2, fakeUser);
      const messagesLoop1 = [
        fakeDiscordMessage({
          author: fakeDiscordUserFromDbUser(users[0]),
        }),
        fakeDiscordMessage({
          author: fakeDiscordUserFromDbUser(users[1]),
        }),
      ];
      const messagesLoop2 = [
        fakeDiscordMessage({
          author: fakeDiscordUserFromDbUser(users[0]),
        }),
      ];

      when(database.getServerUsers)
        .calledWith(channel.serverId)
        .thenResolve(users);
      when(database.getOldestMessage)
        .calledWith(channel.id)
        .thenResolve(undefined);
      when(database.getThreads).calledWith(channel.id).thenResolve([]);

      when(discord.getMessages)
        .calledWith(channel.discordId, { beforeId: undefined })
        .thenResolve(messagesLoop1);
      when(discord.getMessages)
        .calledWith(channel.discordId, {
          beforeId: messagesLoop1[messagesLoop1.length - 1].id,
        })
        .thenResolve(messagesLoop2);
      when(discord.getMessages)
        .calledWith(channel.discordId, {
          beforeId: messagesLoop2[messagesLoop2.length - 1].id,
        })
        .thenResolve([]);

      when(database.upsertMessages)
        .calledWith([
          expect.objectContaining({
            discordId: messagesLoop1[0].id,
          }),
          expect.objectContaining({
            discordId: messagesLoop1[1].id,
          }),
        ])
        .thenResolve([
          fakeMessage({
            authorId: users[0].id,
            discordId: messagesLoop1[0].id,
          }),
          fakeMessage({
            authorId: users[1].id,
            discordId: messagesLoop1[1].id,
          }),
        ]);

      when(database.upsertMessages)
        .calledWith([
          expect.objectContaining({
            discordId: messagesLoop2[0].id,
          }),
        ])
        .thenResolve([
          fakeMessage({
            authorId: users[0].id,
            discordId: messagesLoop2[0].id,
          }),
        ]);

      await syncDiscordChannel(channel);

      expect(database.upsertMessages).toHaveBeenCalledTimes(2);

      expect(database.updateChannel).toHaveBeenCalledWith(channel.id, {
        lastSyncedAt: new Date(fakeDate.getTime() + 2000),
      });
    });
  });
});
