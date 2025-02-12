"use server";

import { deactivateServers, upsertServer } from "@/clients/database";
import discord from "@/clients/discord-client";
import { revalidatePath } from "next/cache";

export async function refreshServers() {
  await deactivateServers();

  const guilds = await discord.getGuilds();

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
