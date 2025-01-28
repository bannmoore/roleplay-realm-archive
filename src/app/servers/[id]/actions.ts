"use server";

import { getDiscordGuildChannels } from "@/api/discord";

export async function getChannelOptions(serverId: string) {
  const all = await getDiscordGuildChannels(serverId);
  return all.filter((c) => c.parent_id);
}

export async function syncChannel(channelId: string) {
  console.log("whee");
}
