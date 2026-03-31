"use server";

import { syncDiscordChannel } from "@/app/utils/discord-sync";
import database from "@/clients/database";
import type { DiscordChannel } from "@/clients/discord";
import discord from "@/clients/discord";
import { revalidatePath } from "next/cache";

export async function getChannelOptions(serverDiscordId: string) {
  const all = await discord.getChannels(serverDiscordId);
  return all.filter((c) => c.parent_id);
}

export async function createAndSyncChannel(
  serverId: string,
  discordChannel: DiscordChannel
) {
  const channel = await database.upsertChannel({
    discordId: discordChannel.id,
    name: discordChannel.name,
    serverId,
    active: true,
  });

  if (!channel) {
    throw new Error("Failed to insert channel.");
  }

  await syncDiscordChannel(channel);

  revalidatePath(`servers/${serverId}`, "page");
}
