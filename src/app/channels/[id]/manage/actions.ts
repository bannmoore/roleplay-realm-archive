"use server";

import database from "@/clients/database";
import discord from "@/clients/discord";

export async function syncImage(attachmentId: string) {
  console.log("syncImage", attachmentId);
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

  console.log(discordMessage);
}
