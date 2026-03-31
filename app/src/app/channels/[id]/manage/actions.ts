"use server";

import database from "@/clients/database";
import discord from "@/clients/discord";
import { revalidatePath } from "next/cache";
import { syncMessageAttachments } from "@/app/utils/discord-sync";

export async function resyncMessages(channelId: string) {
  const channel = await database.getChannel(channelId);

  if (!channel) {
    return;
  }

  const messages = await database.getUnsyncedMessages(channelId);

  for (const message of messages) {
    const threadOrigin = message.threadId
      ? await database.getMessage(message.threadId)
      : undefined;

    const discordMessage = await discord.getMessage({
      channelId: threadOrigin?.discordId ?? channel.discordId,
      messageId: message.discordId,
    });

    await syncMessageAttachments({
      discordMessage,
      dbMessage: message,
    });

    await sleep(1000);
  }

  revalidatePath(`channels/${channelId}/manage`, "page");
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
