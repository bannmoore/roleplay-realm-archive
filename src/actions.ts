"use server";

import { cookies } from "next/headers";
import { DiscordGuild } from "./api/discord-types";
import { upsertServer } from "./api/database";
import discord from "./api/discord-client";

export async function getChannelById(guildId: string) {
  const token = (await cookies()).get("token")?.value;
  let guild = null;

  if (token) {
    guild = await discord.getGuild(guildId);
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
