"use server";

import { syncDiscordChannel } from "@/app/utils/discord-sync";
import type { Channel, MessageWithDisplayData } from "@/clients/database";
import database from "@/clients/database";
import { revalidatePath } from "next/cache";

export async function syncChannel(channel: Channel) {
  await syncDiscordChannel(channel);

  revalidatePath(`channels/${channel.id}`, "page");
}

export async function getThreadMessages(
  parentMessageId: string
): Promise<MessageWithDisplayData[]> {
  return database.getThreadMessages(parentMessageId);
}
