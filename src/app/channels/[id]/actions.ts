"use server";

import database, { Message, Unsaved } from "@/clients/database";
import discord from "@/clients/discord-client";
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
    const newDiscordMessages = await discord.getMessages(channelDiscordId, {
      beforeId: oldestMessageId,
    });

    if (!newDiscordMessages.length) {
      isSyncing = false;
      break;
    }

    const newUnsavedMessages: Unsaved<Message>[] = newDiscordMessages.flatMap(
      (message) => {
        const author = authorUsers.find(
          (user) => user.discordId === message.author.id
        );
        const content = message.content?.replace(/<@[0-9]+>/, "").trim();

        return author && content
          ? [
              {
                channelId,
                discordId: message.id,
                authorId: author.id,
                content,
                discordPublishedAt: new Date(message.timestamp),
              },
            ]
          : [];
      }
    );

    if (newUnsavedMessages.length) {
      await database.upsertMessages(newUnsavedMessages);
    }

    oldestMessageId = newDiscordMessages[newDiscordMessages.length - 1].id;

    await sleep(1000);
  }

  revalidatePath(`channels/${channelId}`, "page");
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
