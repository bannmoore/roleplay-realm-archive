"use server";

import { cookies } from "next/headers";
import { DiscordGuild, getDiscordGuild } from "./api/discord";
import { upsertServer } from "./api/database";

export async function getChannelById(guildId: string) {
  const token = (await cookies()).get("token")?.value;
  let guild = null;

  if (token) {
    guild = await getDiscordGuild(guildId);
  }

  return guild;
}

export async function addServer(guild: DiscordGuild) {
  upsertServer({
    discordId: guild.id,
    name: guild.name,
    iconHash: guild.icon,
  });
}
