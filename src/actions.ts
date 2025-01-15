"use server";

import { cookies } from "next/headers";
import { getGuildAsBot } from "./api/discord";

export async function getChannelById(guildId: string) {
  const token = (await cookies()).get("token")?.value;
  let guild = null;

  if (token) {
    guild = await getGuildAsBot(guildId);
  }

  return guild;
}
