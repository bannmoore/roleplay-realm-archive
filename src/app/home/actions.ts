"use server";

import { deactivateServers, upsertServer } from "@/api/database";
import { getGuildsAsBot } from "@/api/discord";
import { revalidatePath } from "next/cache";

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
