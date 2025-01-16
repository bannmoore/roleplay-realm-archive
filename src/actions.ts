"use server";

import { cookies } from "next/headers";
import {
  DiscordGuildResponse,
  getGuildAsBot,
  getGuildsAsBot,
} from "./api/discord";
import {
  upsertServer,
  getServer as selectServer,
  deactivateServers,
} from "./api/database";
import { revalidatePath } from "next/cache";

export async function getChannelById(guildId: string) {
  const token = (await cookies()).get("token")?.value;
  let guild = null;

  if (token) {
    guild = await getGuildAsBot(guildId);
  }

  return guild;
}

export async function getServer(discordId: string) {
  return selectServer(discordId);
}

export async function addServer(guild: DiscordGuildResponse) {
  upsertServer({
    discordId: guild.id,
    name: guild.name,
    iconHash: guild.icon,
  });
}

export async function refreshServers() {
  await deactivateServers();

  const guilds = await getGuildsAsBot();

  console.log(guilds);

  await Promise.all(
    guilds.map((g) =>
      upsertServer({
        discordId: g.id,
        name: g.name,
        iconHash: g.icon,
      })
    )
  );

  revalidatePath("/");
}
