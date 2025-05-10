"use server";

import database from "@/clients/database";
import discord, { DiscordMessageAttachment } from "@/clients/discord";
import storage from "@/clients/storage";
import { revalidatePath } from "next/cache";

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

      await syncImage({
        discordAttachment,
        serverId: channel.serverId,
        channelId: channel.id,
        messageId: message.id,
        attachmentId: attachment.id,
      });

      await sleep(1000);
    }
  }

  revalidatePath(`channels/${channelId}/manage`, "page");
}

export async function syncImage({
  discordAttachment,
  serverId,
  channelId,
  messageId,
  attachmentId,
}: {
  discordAttachment: DiscordMessageAttachment;
  serverId: string;
  channelId: string;
  messageId: string;
  attachmentId: string;
}) {
  const img = await fetch(discordAttachment.url);
  const buf = await img.arrayBuffer();
  const uri = await storage.uploadMessageAttachment({
    buf,
    filename: attachmentId,
    serverId: serverId,
    channelId: channelId,
    messageId: messageId,
  });

  await database.updateAttachment(attachmentId, {
    sourceUri: uri,
  });
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
