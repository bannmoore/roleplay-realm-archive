"use server";

import database from "@/clients/database";
import discord from "@/clients/discord-client";
import { revalidatePath } from "next/cache";

export async function refreshServers() {
  await database.deactivateServers();

  const guilds = await discord.getGuilds();

  await Promise.all(
    guilds.map((g) =>
      database.upsertServer({
        discordId: g.id,
        name: g.name,
        iconHash: g.icon,
      })
    )
  );

  revalidatePath("/");
}
