"use server";

import database from "@/clients/database";
import discord from "@/clients/discord";
import storage from "@/clients/storage";
import { revalidatePath } from "next/cache";

export async function syncImage(attachmentId: string) {
  const attachment = await database.getAttachment(attachmentId);

  if (!attachment) {
    return;
  }

  const message = await database.getMessage(attachment.messageId);

  if (!message) {
    return;
  }

  const channel = await database.getChannel(message.channelId);

  if (!channel) {
    return;
  }

  const discordMessage = await discord.getMessage({
    channelId: channel.discordId,
    messageId: message.discordId,
  });

  const discordAttachment = discordMessage.attachments.find(
    (a) => a.id === attachment.discordId
  );

  if (!discordAttachment) {
    return;
  }

  const img = await fetch(discordAttachment.url);
  const buf = await img.arrayBuffer();
  const uri = await storage.uploadMessageAttachment({
    buf,
    filename: attachment.id,
    serverId: channel.serverId,
    channelId: channel.id,
    messageId: message.id,
  });

  await database.updateAttachment(attachmentId, {
    sourceUri: uri,
  });

  revalidatePath(`channels/${channel.id}/manage`, "page");
}
