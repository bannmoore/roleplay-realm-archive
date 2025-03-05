"use server";

import database, { MessageWithUser } from "@/clients/database";
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
  let oldestMessageId = oldestMessage?.discord_id;
  let isSyncing = true;

  while (isSyncing) {
    const newMessages = await discord.getMessages(channelDiscordId, {
      beforeId: oldestMessageId,
    });

    if (!newMessages.length) {
      isSyncing = false;
      break;
    }

    const newMessagesWithUsers: MessageWithUser[] = newMessages.flatMap((m) => {
      const author = authorUsers.find((row) => row.discord_id === m.author.id);
      const content = m.content?.replace(/<@[0-9]+>/, "").trim();

      return author && content
        ? [
            {
              ...m,
              content: m.content?.replace(/<@[0-9]+>/, "").trim(),
              author_user: author,
            },
          ]
        : [];
    });

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
