"use server";

import database from "@/clients/database";
import discord from "@/clients/discord-client";
import { messageFromDiscordMessage, UnsavedMessage } from "@/dtos/message";
import { revalidatePath } from "next/cache";

export async function syncChannel({
  channelId,
  channelDiscordId,
  serverId,
}: {
  channelId: string;
  channelDiscordId: string;
  serverId: string;
}) {
  const authorUsers = await database.getServerUsers(serverId);

  const oldestMessage = await database.getOldestMessage(channelId);
  let oldestMessageId = oldestMessage?.discordId;
  let isSyncing = true;

  while (isSyncing) {
    const newMessages = await discord.getMessages(channelDiscordId, {
      beforeId: oldestMessageId,
    });

    if (!newMessages.length) {
      isSyncing = false;
      break;
    }

    const newMessagesWithUsers: UnsavedMessage[] = newMessages.flatMap(
      (message) => {
        const author = authorUsers.find(
          (user) => user.discordId === message.author.id
        );
        const content = message.content?.replace(/<@[0-9]+>/, "").trim();

        return author && content
          ? [messageFromDiscordMessage(message, author.id)]
          : [];
      }
    );

    console.log(newMessagesWithUsers);

    if (newMessagesWithUsers.length) {
      await database.upsertMessages(channelId, newMessagesWithUsers);
    }

    oldestMessageId = newMessages[newMessages.length - 1].id;

    await sleep(1000);
  }

  revalidatePath(`channels/${channelId}`, "page");
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
