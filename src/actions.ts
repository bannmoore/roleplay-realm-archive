"use server";

import { cookies } from "next/headers";
import { DiscordGuild } from "./clients/discord-types";
import database from "./clients/database";
import discord from "./clients/discord-client";

export async function getChannelById(guildId: string) {
  const token = (await cookies()).get("token")?.value;
  let guild = null;

  if (token) {
    guild = await discord.getGuild(guildId);
  }

  return guild;
}

export async function addServer(guild: DiscordGuild) {
  database.upsertServer({
    discordId: guild.id,
    name: guild.name,
    iconHash: guild.icon,
  });
}
