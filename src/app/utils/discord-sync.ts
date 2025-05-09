"use server";

import database, {
  Channel,
  Message,
  MessageAttachment,
  Unsaved,
  User,
} from "@/clients/database";
import discord from "@/clients/discord";
import type { DiscordMessage } from "@/clients/discord";

export async function syncDiscordChannel(channel: Channel) {
  const authorUsers = await database.getServerUsers(channel.serverId);

  const oldestMessage = await database.getOldestMessage(channel.id);
  let oldestMessageId = oldestMessage?.discordId;
  let isSyncing = true;

  while (isSyncing) {
    const newDiscordMessages = await discord.getMessages(channel.discordId, {
      beforeId: oldestMessageId,
    });

    if (!newDiscordMessages.length) {
      isSyncing = false;
      break;
    }

    const newUnsavedMessages = zipMessagesAndAuthors({
      channelId: channel.id,
      users: authorUsers,
      messages: newDiscordMessages,
    });

    if (newUnsavedMessages.length) {
      const createdMessages = await database.upsertMessages(newUnsavedMessages);

      await syncMessageAttachments({
        discordMessages: newDiscordMessages,
        dbMessages: createdMessages,
      });

      oldestMessageId =
        newUnsavedMessages[newUnsavedMessages.length - 1].discordId;
    }

    await sleep(1000);
  }

  const threadOrigins = await database.getThreadOriginMessages(channel.id);
  threadOrigins.forEach(async (threadOrigin) => {
    await syncDiscordMessageThread({
      threadOrigin,
      authorUsers,
    });
  });

  await database.updateChannel(channel.id, {
    lastSyncedAt: new Date(),
  });
}

async function syncDiscordMessageThread({
  threadOrigin,
  authorUsers,
}: {
  threadOrigin: Message;
  authorUsers: User[];
}) {
  const oldestThreadMessage = await database.getOldestThreadMessage(
    threadOrigin.id
  );
  let oldestThreadMessageId = oldestThreadMessage?.discordId;
  let isSyncingThreads = true;

  while (isSyncingThreads) {
    const newDiscordThreadMessages = await discord.getThreadMessages(
      threadOrigin.discordId,
      {
        beforeId: oldestThreadMessageId,
      }
    );

    if (!newDiscordThreadMessages.length) {
      isSyncingThreads = false;
      break;
    }

    const newUnsavedThreadMessages = zipMessagesAndAuthors({
      channelId: threadOrigin.channelId,
      users: authorUsers,
      messages: newDiscordThreadMessages,
      threadOrigin,
    });

    if (newUnsavedThreadMessages.length) {
      const createdThreadMessages = await database.upsertMessages(
        newUnsavedThreadMessages
      );

      await syncMessageAttachments({
        discordMessages: newDiscordThreadMessages,
        dbMessages: createdThreadMessages,
      });

      oldestThreadMessageId =
        newUnsavedThreadMessages[newUnsavedThreadMessages.length - 1].discordId;
    }

    await sleep(1000);
  }
}

async function syncMessageAttachments({
  discordMessages,
  dbMessages,
}: {
  discordMessages: DiscordMessage[];
  dbMessages: Message[];
}) {
  let attachments: Unsaved<MessageAttachment>[] = [];

  discordMessages.forEach((discordMessage) => {
    const dbMessage = dbMessages.find((m) => m.discordId === discordMessage.id);

    if (dbMessage) {
      attachments = attachments.concat(
        discordMessage.attachments.map((attachment) => ({
          discordId: attachment.id,
          messageId: dbMessage.id,
          discordSourceUri: attachment.url,
          sourceUri: null,
          width: attachment.width ?? null,
          height: attachment.height ?? null,
        }))
      );
    }
  });

  if (attachments.length) {
    await database.upsertMessagesAttachments(attachments);
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Trim whitespace and mentions (@username) from message content
function trimMessageContent(content?: string) {
  return content?.replaceAll(/<@[0-9]+>/g, "").trim();
}

function zipMessagesAndAuthors({
  channelId,
  users,
  messages,
  threadOrigin,
}: {
  channelId: string;
  users: User[];
  messages: DiscordMessage[];
  threadOrigin?: Message;
}): Unsaved<Message>[] {
  return messages.flatMap((message) => {
    const author = users.find((user) => user.discordId === message.author.id);
    const content = trimMessageContent(message.content);

    return author && (content || message.attachments?.length)
      ? [
          {
            channelId,
            discordId: message.id,
            authorId: author.id,
            content: content ?? null,
            discordPublishedAt: new Date(message.timestamp),
            isThread: !!message.thread,
            threadId: threadOrigin?.id ?? null,
          },
        ]
      : [];
  });
}
