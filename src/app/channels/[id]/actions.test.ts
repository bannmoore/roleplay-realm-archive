import { describe, expect, test, vi } from "vitest";
import { when } from "vitest-when";
import { beforeEach } from "node:test";
import database from "@/clients/database";
import discord from "@/clients/discord";
import { syncChannel } from "./actions";
import { revalidatePath } from "next/cache";
import { fakeArray } from "@/test/fakes";
import { fakeDiscordMessage } from "@/test/fakes/discord";
import { fakeUser } from "@/test/fakes/database";

vi.mock("@/clients/database");
vi.mock("@/clients/discord-client");
vi.mock("next/cache");

describe("/channels/[id].actions", async () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("syncChannel", async () => {
    test("upserts nothing", async () => {
      when(database.getServerUsers).calledWith("3").thenResolve([]);
      when(database.getOldestMessage).calledWith("1").thenResolve(undefined);
      when(discord.getMessages)
        .calledWith("111111", { beforeId: undefined })
        .thenResolve([]);

      await syncChannel({
        serverId: "3",
        channelId: "1",
        channelDiscordId: "111111",
      });

      expect(database.upsertMessages).not.toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith("channels/1", "page");
    });

    test("upserts new messages", async () => {
      const users = fakeArray(2, fakeUser);
      const messages = [
        fakeDiscordMessage({
          author: {
            id: users[0].discordId,
            username: users[0].discordUsername,
            global_name: users[0].discordUsername,
          },
        }),
        fakeDiscordMessage({
          author: {
            id: users[1].discordId,
            username: users[1].discordUsername,
            global_name: users[1].discordUsername,
          },
        }),
      ];

      when(database.getServerUsers).calledWith("3").thenResolve(users);
      when(database.getOldestMessage).calledWith("1").thenResolve(undefined);
      when(discord.getMessages)
        .calledWith("111111", { beforeId: undefined })
        .thenResolve(messages);

      when(discord.getMessages)
        .calledWith("111111", { beforeId: messages[1].id })
        .thenResolve([]);

      await syncChannel({
        serverId: "3",
        channelId: "1",
        channelDiscordId: "111111",
      });

      expect(database.upsertMessages).toHaveBeenCalledWith("1", [
        expect.objectContaining({
          discordId: messages[0].id,
        }),
        expect.objectContaining({
          discordId: messages[1].id,
        }),
      ]);
      expect(revalidatePath).toHaveBeenCalledWith("channels/1", "page");
    });
  });
});
