"use server";

import database from "@/clients/database";
import discord from "@/clients/discord";
import { revalidatePath } from "next/cache";
import { syncImage } from "@/app/utils/discord-sync";

export async function syncAllImages(channelId: string) {
  const channel = await database.getChannel(channelId);

  if (!channel) {
    return;
  }

  const messages = await database.getMessagesWithUnsyncedAttachments(channelId);
  const attachments = messages.flatMap((message) => message.attachments);

  for (const message of messages) {
    const threadOrigin = message.threadId
      ? await database.getMessage(message.threadId)
      : undefined;

    const discordMessage = await discord.getMessage({
      channelId: threadOrigin?.discordId ?? channel.discordId,
      messageId: message.discordId,
    });
    await sleep(1000);

    for (const discordAttachment of discordMessage.attachments) {
      const attachment = attachments.find(
        (a) => a.discordId === discordAttachment.id
      );

      if (!attachment) {
        return;
      }

      const path = await syncImage(message.id, discordAttachment);

      await database.updateAttachment(attachment.id, {
        sourceUri: path,
      });

      await sleep(1000);
    }
  }

  revalidatePath(`channels/${channelId}/manage`, "page");
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
