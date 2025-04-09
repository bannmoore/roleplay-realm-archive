"use server";

import database, { Message, Unsaved, User } from "@/clients/database";
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
                isThread: !!message.thread,
                threadId: null,
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

  const threads = await database.getThreads(channelId);
  threads.forEach(async (thread) => {
    await syncThread({
      thread,
      authorUsers,
    });
  });

  revalidatePath(`channels/${channelId}`, "page");
}

async function syncThread({
  thread,
  authorUsers,
}: {
  thread: Message;
  authorUsers: User[];
}) {
  const oldestThreadMessage = await database.getOldestThreadMessage(thread.id);
  let oldestThreadMessageId = oldestThreadMessage?.discordId;
  let isSyncingThreads = true;

  while (isSyncingThreads) {
    const newDiscordThreadMessages = await discord.getThreadMessages(
      thread.discordId,
      {
        beforeId: oldestThreadMessageId,
      }
    );

    if (!newDiscordThreadMessages.length) {
      isSyncingThreads = false;
      break;
    }

    const newUnsavedThreadMessages: Unsaved<Message>[] =
      newDiscordThreadMessages.flatMap((message) => {
        const author = authorUsers.find(
          (user) => user.discordId === message.author.id
        );
        const content = message.content?.replace(/<@[0-9]+>/, "").trim();

        return author && (content || message.attachments?.length)
          ? [
              {
                channelId: thread.channelId,
                discordId: message.id,
                authorId: author.id,
                content: content ?? "",
                discordPublishedAt: new Date(message.timestamp),
                isThread: !!message.thread,
                threadId: thread.id,
              },
            ]
          : [];
      });

    if (newUnsavedThreadMessages.length) {
      await database.upsertMessages(newUnsavedThreadMessages);
    }

    oldestThreadMessageId =
      newDiscordThreadMessages[newDiscordThreadMessages.length - 1].id;

    await sleep(1000);
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getThreadMessages(
  parentMessageId: string
): Promise<Message[]> {
  return database.getThreadMessages(parentMessageId);
}
