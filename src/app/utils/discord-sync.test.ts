import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
import { when } from "vitest-when";
import database from "@/clients/database";
import discord from "@/clients/discord";
import { syncDiscordChannel } from "./discord-sync";
import { fakeArray } from "@/test/fakes";
import {
  fakeDiscordChannel,
  fakeDiscordMessage,
  fakeDiscordMessageAttachment,
  fakeDiscordUser,
} from "@/test/fakes/discord";
import {
  fakeChannel,
  fakeMessage,
  fakeUserFromDiscordUser,
} from "@/test/fakes/database";
import { faker } from "@faker-js/faker";
import storage from "@/clients/storage";

vi.mock("@/clients/database");
vi.mock("@/clients/discord");
vi.mock("@/clients/storage");
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
      when(database.getThreadOriginMessages)
        .calledWith(channel.id)
        .thenResolve([]);

      await syncDiscordChannel(channel);

      expect(database.upsertMessages).not.toHaveBeenCalled();
      expect(database.updateChannel).toHaveBeenCalledWith(channel.id, {
        lastSyncedAt: fakeDate,
      });
    });

    test("upserts all messages on new channel", async () => {
      const fakeDate = faker.date.past();
      vi.setSystemTime(fakeDate);

      const discordUsers = fakeArray(2, fakeDiscordUser);
      const discordMessages = [
        fakeDiscordMessage({
          author: discordUsers[0],
        }),
        fakeDiscordMessage({
          author: discordUsers[1],
        }),
      ];

      const channel = fakeChannel();
      const users = discordUsers.map(fakeUserFromDiscordUser);

      const createdMessages = [
        fakeMessage({
          authorId: users[0].id,
          discordId: discordMessages[0].id,
        }),
        fakeMessage({
          authorId: users[1].id,
          discordId: discordMessages[1].id,
        }),
      ];

      when(database.getServerUsers)
        .calledWith(channel.serverId)
        .thenResolve(users);
      when(database.getOldestMessage)
        .calledWith(channel.id)
        .thenResolve(undefined);
      when(database.getNewestMessage)
        .calledWith(channel.id)
        .thenResolve(createdMessages[1]);
      when(discord.getMessages)
        .calledWith(channel.discordId, { beforeId: undefined })
        .thenResolve(discordMessages);
      when(discord.getMessages)
        .calledWith(channel.discordId, {
          beforeId: discordMessages[discordMessages.length - 1].id,
        })
        .thenResolve([]);
      when(discord.getMessages)
        .calledWith(channel.discordId, {
          afterId: createdMessages[1].discordId,
        })
        .thenResolve([]);

      when(database.upsertMessages)
        .calledWith([
          expect.objectContaining({
            discordId: discordMessages[0].id,
          }),
          expect.objectContaining({
            discordId: discordMessages[1].id,
          }),
        ])
        .thenResolve(createdMessages);

      when(database.getThreadOriginMessages)
        .calledWith(channel.id)
        .thenResolve([]);

      await syncDiscordChannel(channel);

      expect(database.upsertMessages).toHaveBeenCalledTimes(1);

      expect(database.updateChannel).toHaveBeenCalledWith(channel.id, {
        lastSyncedAt: new Date(fakeDate.getTime() + 1000),
      });
    });

    test("upserts new messages on existing channel", async () => {
      const fakeDate = faker.date.past();
      vi.setSystemTime(fakeDate);

      const discordUsers = fakeArray(2, fakeDiscordUser);
      const discordMessages = [
        fakeDiscordMessage({
          author: discordUsers[0],
        }),
        fakeDiscordMessage({
          author: discordUsers[1],
        }),
      ];

      const channel = fakeChannel();
      const users = discordUsers.map(fakeUserFromDiscordUser);

      const existingMessages = [
        fakeMessage({
          authorId: users[0].id,
        }),
        fakeMessage({
          authorId: users[1].id,
        }),
      ];

      const createdMessages = [
        fakeMessage({
          authorId: users[0].id,
          discordId: discordMessages[0].id,
        }),
        fakeMessage({
          authorId: users[1].id,
          discordId: discordMessages[1].id,
        }),
      ];

      when(database.getServerUsers)
        .calledWith(channel.serverId)
        .thenResolve(users);
      when(database.getOldestMessage)
        .calledWith(channel.id)
        .thenResolve(existingMessages[0]);
      when(database.getNewestMessage)
        .calledWith(channel.id)
        .thenResolve(existingMessages[1]);
      when(discord.getMessages)
        .calledWith(channel.discordId, {
          beforeId: existingMessages[0].discordId,
        })
        .thenResolve([]);
      when(discord.getMessages)
        .calledWith(channel.discordId, {
          afterId: existingMessages[1].discordId,
        })
        .thenResolve(discordMessages);
      when(discord.getMessages)
        .calledWith(channel.discordId, {
          afterId: createdMessages[1].discordId,
        })
        .thenResolve([]);

      when(database.upsertMessages)
        .calledWith([
          expect.objectContaining({
            discordId: discordMessages[0].id,
          }),
          expect.objectContaining({
            discordId: discordMessages[1].id,
          }),
        ])
        .thenResolve(createdMessages);

      when(database.getThreadOriginMessages)
        .calledWith(channel.id)
        .thenResolve([]);

      await syncDiscordChannel(channel);

      expect(database.upsertMessages).toHaveBeenCalledTimes(1);

      expect(database.updateChannel).toHaveBeenCalledWith(channel.id, {
        lastSyncedAt: new Date(fakeDate.getTime() + 1000),
      });
    });

    test("filter out messages with no story content and no attachments", async () => {
      const fakeDate = faker.date.past();
      vi.setSystemTime(fakeDate);

      const discordUsers = fakeArray(2, fakeDiscordUser);
      const discordMessages = [
        fakeDiscordMessage({
          author: discordUsers[0],
          content: "",
        }),
        fakeDiscordMessage({
          author: discordUsers[1],
          content: "Actual content!",
        }),
        fakeDiscordMessage({
          author: discordUsers[1],
          content: `<@${discordUsers[0].id}>`,
        }),
        fakeDiscordMessage({
          author: discordUsers[0],
          content: "",
          attachments: [fakeDiscordMessageAttachment()],
        }),
        fakeDiscordMessage({
          author: discordUsers[0],
          content: `<@${discordUsers[1].id}> <@${discordUsers[1].id}>`,
        }),
      ];

      const channel = fakeChannel();
      const users = discordUsers.map(fakeUserFromDiscordUser);
      const createdMessages = [
        fakeMessage({
          channelId: channel.id,
          authorId: users[1].id,
          discordId: discordMessages[1].id,
        }),
        fakeMessage({
          channelId: channel.id,
          authorId: users[0].id,
          discordId: discordMessages[3].id,
        }),
      ];

      when(database.getServerUsers)
        .calledWith(channel.serverId)
        .thenResolve(users);
      when(database.getOldestMessage)
        .calledWith(channel.id)
        .thenResolve(undefined);
      when(database.getNewestMessage)
        .calledWith(channel.id)
        .thenResolve(createdMessages[1]);
      when(discord.getMessages)
        .calledWith(channel.discordId, { beforeId: undefined })
        .thenResolve(discordMessages);
      when(discord.getMessages)
        .calledWith(channel.discordId, {
          beforeId: discordMessages[3].id,
        })
        .thenResolve([]);
      when(discord.getMessages)
        .calledWith(channel.discordId, {
          afterId: createdMessages[1].discordId,
        })
        .thenResolve([]);
      when(database.upsertMessages)
        .calledWith([
          expect.objectContaining({
            discordId: discordMessages[1].id,
          }),
          expect.objectContaining({
            discordId: discordMessages[3].id,
          }),
        ])
        .thenResolve(createdMessages);

      when(database.getThreadOriginMessages)
        .calledWith(channel.id)
        .thenResolve([]);

      await syncDiscordChannel(channel);

      expect(database.upsertMessages).toHaveBeenCalledTimes(1);

      expect(database.upsertMessagesAttachments).toHaveBeenCalledWith([
        {
          messageId: createdMessages[1].id,
          discordId: discordMessages[3].attachments[0].id,
          storagePath: undefined,
          width: discordMessages[3].attachments[0].width,
          height: discordMessages[3].attachments[0].height,
        },
      ]);

      expect(database.updateChannel).toHaveBeenCalledWith(channel.id, {
        lastSyncedAt: new Date(fakeDate.getTime() + 1000),
      });
    });

    test("upserts multiple loops of new messages", async () => {
      const fakeDate = faker.date.past();
      vi.setSystemTime(fakeDate);

      const discordUsers = fakeArray(2, fakeDiscordUser);
      const discordMessagesLoop1 = [
        fakeDiscordMessage({
          author: discordUsers[0],
        }),
        fakeDiscordMessage({
          author: discordUsers[1],
        }),
      ];
      const discordMessagesLoop2 = [
        fakeDiscordMessage({
          author: discordUsers[0],
        }),
      ];

      const channel = fakeChannel();
      const users = discordUsers.map(fakeUserFromDiscordUser);

      const createdMessages = [
        fakeMessage({
          authorId: users[0].id,
          discordId: discordMessagesLoop1[0].id,
        }),
        fakeMessage({
          authorId: users[1].id,
          discordId: discordMessagesLoop1[1].id,
        }),
        fakeMessage({
          authorId: users[0].id,
          discordId: discordMessagesLoop2[0].id,
        }),
      ];

      when(database.getServerUsers)
        .calledWith(channel.serverId)
        .thenResolve(users);
      when(database.getOldestMessage)
        .calledWith(channel.id)
        .thenResolve(undefined);
      when(database.getNewestMessage)
        .calledWith(channel.id)
        .thenResolve(createdMessages[2]);
      when(database.getThreadOriginMessages)
        .calledWith(channel.id)
        .thenResolve([]);

      when(discord.getMessages)
        .calledWith(channel.discordId, { beforeId: undefined })
        .thenResolve(discordMessagesLoop1);
      when(discord.getMessages)
        .calledWith(channel.discordId, {
          beforeId: discordMessagesLoop1[discordMessagesLoop1.length - 1].id,
        })
        .thenResolve(discordMessagesLoop2);
      when(discord.getMessages)
        .calledWith(channel.discordId, {
          beforeId: discordMessagesLoop2[discordMessagesLoop2.length - 1].id,
        })
        .thenResolve([]);
      when(discord.getMessages)
        .calledWith(channel.discordId, {
          afterId: createdMessages[2].discordId,
        })
        .thenResolve([]);

      when(database.upsertMessages)
        .calledWith([
          expect.objectContaining({
            discordId: discordMessagesLoop1[0].id,
          }),
          expect.objectContaining({
            discordId: discordMessagesLoop1[1].id,
          }),
        ])
        .thenResolve([createdMessages[0], createdMessages[1]]);

      when(database.upsertMessages)
        .calledWith([
          expect.objectContaining({
            discordId: discordMessagesLoop2[0].id,
          }),
        ])
        .thenResolve([createdMessages[2]]);

      await syncDiscordChannel(channel);

      expect(database.upsertMessages).toHaveBeenCalledTimes(2);

      expect(database.updateChannel).toHaveBeenCalledWith(channel.id, {
        lastSyncedAt: new Date(fakeDate.getTime() + 2000),
      });
    });

    test("syncs all thread messages through channel sync", async () => {
      const fakeDate = faker.date.past();
      vi.setSystemTime(fakeDate);

      const discordUsers = fakeArray(2, fakeDiscordUser);
      const discordThread = fakeDiscordChannel();
      const discordChannelMessages = [
        fakeDiscordMessage({
          author: discordUsers[0],
        }),
        fakeDiscordMessage({
          author: discordUsers[1],
          thread: discordThread,
        }),
      ];
      const discordThreadMessages = [
        fakeDiscordMessage({
          author: discordUsers[0],
        }),
      ];

      const users = discordUsers.map(fakeUserFromDiscordUser);
      const channel = fakeChannel();
      const createdThreadOrigin = fakeMessage({
        discordId: discordThreadMessages[0].id,
      });

      const createdMessages = [
        fakeMessage({
          authorId: users[0].id,
          discordId: discordChannelMessages[0].id,
          threadId: createdThreadOrigin.id,
        }),
        fakeMessage({
          authorId: users[1].id,
          discordId: discordChannelMessages[1].id,
          threadId: createdThreadOrigin.id,
        }),
      ];

      when(discord.getMessages)
        .calledWith(channel.discordId, { beforeId: undefined })
        .thenResolve(discordChannelMessages);
      when(discord.getMessages)
        .calledWith(channel.discordId, {
          beforeId:
            discordChannelMessages[discordChannelMessages.length - 1].id,
        })
        .thenResolve([]);
      when(discord.getMessages)
        .calledWith(channel.discordId, {
          afterId: createdMessages[1].discordId,
        })
        .thenResolve([]);

      when(discord.getThreadMessages)
        .calledWith(createdThreadOrigin.discordId, { beforeId: undefined })
        .thenResolve(discordThreadMessages);

      when(database.getServerUsers)
        .calledWith(channel.serverId)
        .thenResolve(users);
      when(database.getOldestMessage)
        .calledWith(channel.id)
        .thenResolve(undefined);
      when(database.getNewestMessage)
        .calledWith(channel.id)
        .thenResolve(createdMessages[1]);
      when(database.getThreadOriginMessages)
        .calledWith(channel.id)
        .thenResolve([createdThreadOrigin]);

      when(database.getOldestThreadMessage)
        .calledWith(createdThreadOrigin.id)
        .thenResolve(undefined);
      when(discord.getThreadMessages)
        .calledWith(createdThreadOrigin.discordId, {
          beforeId: discordThreadMessages[discordThreadMessages.length - 1].id,
        })
        .thenResolve([]);

      when(database.upsertMessages)
        .calledWith([
          expect.objectContaining({
            discordId: discordChannelMessages[0].id,
          }),
          expect.objectContaining({
            discordId: discordChannelMessages[1].id,
          }),
        ])
        .thenResolve(createdMessages);

      when(database.upsertMessages)
        .calledWith([
          expect.objectContaining({
            discordId: discordThreadMessages[0].id,
            threadId: createdThreadOrigin.id,
          }),
        ])
        .thenResolve([
          fakeMessage({
            authorId: users[0].id,
            discordId: discordThreadMessages[0].id,
            threadId: createdThreadOrigin.id,
          }),
        ]);

      await syncDiscordChannel(channel);

      expect(database.upsertMessages).toHaveBeenCalledTimes(2);

      expect(database.updateChannel).toHaveBeenCalledWith(channel.id, {
        lastSyncedAt: new Date(fakeDate.getTime() + 1000),
      });
    });

    test("syncs new thread messages through channel sync", async () => {
      const fakeDate = faker.date.past();
      vi.setSystemTime(fakeDate);

      const discordUsers = fakeArray(2, fakeDiscordUser);
      const discordThreadMessages = [
        fakeDiscordMessage({
          author: discordUsers[0],
        }),
      ];

      const users = discordUsers.map(fakeUserFromDiscordUser);
      const channel = fakeChannel();

      const existingMessages = [
        fakeMessage({
          authorId: users[0].id,
          isThread: true,
        }),
      ];

      const existingThreadMessages = [
        fakeMessage({
          authorId: users[1].id,
          threadId: existingMessages[0].id,
        }),
        fakeMessage({
          authorId: users[1].id,
          threadId: existingMessages[0].id,
        }),
      ];

      const createdThreadMessages = [
        fakeMessage({
          authorId: users[1].id,
          discordId: discordThreadMessages[0].id,
          threadId: existingMessages[0].id,
        }),
      ];

      when(discord.getMessages)
        .calledWith(channel.discordId, {
          beforeId: existingMessages[0].discordId,
        })
        .thenResolve([]);
      when(discord.getMessages)
        .calledWith(channel.discordId, {
          afterId: existingMessages[0].discordId,
        })
        .thenResolve(discordThreadMessages);
      when(discord.getMessages)
        .calledWith(channel.discordId, {
          afterId: discordThreadMessages[0].id,
        })
        .thenResolve([]);

      when(discord.getThreadMessages)
        .calledWith(existingMessages[0].discordId, {
          beforeId: existingThreadMessages[0].discordId,
        })
        .thenResolve([]);
      when(discord.getThreadMessages)
        .calledWith(existingMessages[0].discordId, {
          afterId: existingThreadMessages[1].discordId,
        })
        .thenResolve(discordThreadMessages);
      when(discord.getThreadMessages)
        .calledWith(existingMessages[0].discordId, {
          afterId: createdThreadMessages[0].discordId,
        })
        .thenResolve([]);

      when(database.getServerUsers)
        .calledWith(channel.serverId)
        .thenResolve(users);
      when(database.getOldestMessage)
        .calledWith(channel.id)
        .thenResolve(existingMessages[0]);
      when(database.getNewestMessage)
        .calledWith(channel.id)
        .thenResolve(existingMessages[0]);
      when(database.getThreadOriginMessages)
        .calledWith(channel.id)
        .thenResolve(existingMessages);

      when(database.getOldestThreadMessage)
        .calledWith(existingMessages[0].id)
        .thenResolve(existingThreadMessages[0]);
      when(database.getNewestThreadMessage)
        .calledWith(existingMessages[0].id)
        .thenResolve(existingThreadMessages[1]);
      when(discord.getThreadMessages)
        .calledWith(existingMessages[0].discordId, {
          beforeId: existingThreadMessages[0].discordId,
        })
        .thenResolve([]);
      when(discord.getThreadMessages)
        .calledWith(existingMessages[0].discordId, {
          afterId: existingThreadMessages[1].discordId,
        })
        .thenResolve(discordThreadMessages);
      when(discord.getThreadMessages)
        .calledWith(existingMessages[0].discordId, {
          afterId: createdThreadMessages[0].discordId,
        })
        .thenResolve([]);

      when(database.upsertMessages)
        .calledWith([
          expect.objectContaining({
            discordId: discordThreadMessages[0].id,
          }),
        ])
        .thenResolve(createdThreadMessages);

      await syncDiscordChannel(channel);

      expect(database.upsertMessages).toHaveBeenCalledTimes(1);

      expect(database.updateChannel).toHaveBeenCalledWith(channel.id, {
        lastSyncedAt: new Date(fakeDate.getTime() + 1000),
      });
    });

    test("syncs message attachments through channel sync", async () => {
      const fakeDate = faker.date.past();
      vi.setSystemTime(fakeDate);

      const discordUsers = fakeArray(1, fakeDiscordUser);
      const discordMessage = fakeDiscordMessage({
        author: discordUsers[0],
        attachments: [
          fakeDiscordMessageAttachment(),
          fakeDiscordMessageAttachment(),
        ],
      });

      const channel = fakeChannel();
      const users = discordUsers.map(fakeUserFromDiscordUser);
      const createdMessage = fakeMessage({
        channelId: channel.id,
        authorId: users[0].id,
        discordId: discordMessage.id,
      });

      when(database.getServerUsers)
        .calledWith(channel.serverId)
        .thenResolve(users);
      when(database.getOldestMessage)
        .calledWith(channel.id)
        .thenResolve(undefined);
      when(database.getNewestMessage)
        .calledWith(channel.id)
        .thenResolve(createdMessage);
      when(discord.getMessages)
        .calledWith(channel.discordId, { beforeId: undefined })
        .thenResolve([discordMessage]);
      when(discord.getMessages)
        .calledWith(channel.discordId, {
          beforeId: discordMessage.id,
        })
        .thenResolve([]);
      when(discord.getMessages)
        .calledWith(channel.discordId, {
          afterId: createdMessage.discordId,
        })
        .thenResolve([]);
      when(database.getThreadOriginMessages)
        .calledWith(channel.id)
        .thenResolve([]);

      when(database.upsertMessages)
        .calledWith([
          expect.objectContaining({
            discordId: discordMessage.id,
          }),
        ])
        .thenResolve([createdMessage]);

      when(discord.downloadAttachment)
        .calledWith(discordMessage.attachments[0])
        .thenResolve(new ArrayBuffer(10));
      when(discord.downloadAttachment)
        .calledWith(discordMessage.attachments[1])
        .thenResolve(new ArrayBuffer(10));

      when(storage.uploadFile)
        .calledWith({
          buf: expect.any(ArrayBuffer),
          path: `message-attachments/${createdMessage.id}/${discordMessage.attachments[0].filename}`,
        })
        .thenResolve("/uploaded-path-1/file.png");
      when(storage.uploadFile)
        .calledWith({
          buf: expect.any(ArrayBuffer),
          path: `message-attachments/${createdMessage.id}/${discordMessage.attachments[1].filename}`,
        })
        .thenResolve("/uploaded-path-2/file.png");

      await syncDiscordChannel(channel);

      expect(database.upsertMessagesAttachments).toHaveBeenCalledWith([
        {
          messageId: createdMessage.id,
          discordId: discordMessage.attachments[0].id,
          storagePath: "/uploaded-path-1/file.png",
          width: discordMessage.attachments[0].width,
          height: discordMessage.attachments[0].height,
        },
        {
          messageId: createdMessage.id,
          discordId: discordMessage.attachments[1].id,
          storagePath: "/uploaded-path-2/file.png",
          width: discordMessage.attachments[1].width,
          height: discordMessage.attachments[1].height,
        },
      ]);
    });
  });
});
