"use server";

import { syncDiscordChannel } from "@/app/utils/discord-sync";
import type { Channel, MessageWithDisplayData } from "@/clients/database";
import database from "@/clients/database";
import storage from "@/clients/storage";
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

export async function getPresignedUrl(url: string) {
  return storage.getPresignedUrl(url);
}
