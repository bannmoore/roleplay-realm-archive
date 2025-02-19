"use server";

import database from "@/clients/database";
import discord from "@/clients/discord-client";
import { revalidatePath } from "next/cache";

export async function refreshServers() {
  await database.deactivateServers();

  const guilds = await discord.getGuilds();

  await Promise.all(
    guilds.map(async (g) => {
      const server = await database.upsertServer({
        discordId: g.id,
        name: g.name,
        iconHash: g.icon,
      });

      const members = await discord.getGuildMembers(server.discord_id);
      await database.upsertUsers(members);

      return;
    })
  );

  revalidatePath("/");
}
