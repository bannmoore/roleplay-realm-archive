import { describe, expect, test, vi } from "vitest";
import { when } from "vitest-when";
import { beforeEach } from "node:test";
import database from "@/clients/database";
import discord from "@/clients/discord-client";
import { syncChannel } from "./actions";
import { revalidatePath } from "next/cache";

vi.mock("@/clients/database");
vi.mock("@/clients/discord-client");
vi.mock("next/cache");

describe("/channels/[id].actions", async () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("syncChannel", async () => {
    test("upserts nothing when no new messages returned", async () => {
      when(database.getServerUsers)
        .calledWith("3")
        .thenResolve([
          {
            created_at: new Date(),
            discord_id: "user1",
            id: "1",
            updated_at: new Date(),
            discord_username: "itsme",
          },
          {
            created_at: new Date(),
            discord_id: "user2",
            id: "2",
            updated_at: new Date(),
            discord_username: "itsyou",
          },
        ]);

      when(database.getOldestMessage).calledWith("1").thenResolve(undefined);

      when(discord.getMessages)
        .calledWith("foo", { beforeId: undefined })
        .thenResolve([]);

      await syncChannel({
        channel: {
          active: true,
          created_at: new Date(),
          discord_id: "foo",
          id: "1",
          name: "bar",
          server_id: "3",
          updated_at: new Date(),
        },
      });

      expect(database.upsertMessages).not.toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith("channels/1", "page");
    });
  });
});
