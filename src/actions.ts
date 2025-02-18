"use server";

import { DiscordGuild } from "./clients/discord-types";
import database from "./clients/database";
import discord from "./clients/discord-client";

export async function getChannelById(guildId: string) {
  return discord.getGuild(guildId);
}

export async function addServer(guild: DiscordGuild) {
  database.upsertServer({
    discordId: guild.id,
    name: guild.name,
    iconHash: guild.icon,
  });
}
