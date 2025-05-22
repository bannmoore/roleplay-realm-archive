"use server";

import database, { Channel, Message, Unsaved, User } from "@/clients/database";
import discord from "@/clients/discord";
import type {
  DiscordMessage,
  DiscordMessageAttachment,
} from "@/clients/discord";
import storage from "@/clients/storage";

export async function syncDiscordChannel(channel: Channel) {
  const authorUsers = await database.getServerUsers(channel.serverId);

  /* OLD MESSAGES */

  const oldestMessage = await database.getOldestMessage(channel.id);
  let oldestMessageId = oldestMessage?.discordId;
  let isSyncingOld = true;

  while (isSyncingOld) {
    const newDiscordMessages = await discord.getMessages(channel.discordId, {
      beforeId: oldestMessageId,
    });

    if (!newDiscordMessages.length) {
      isSyncingOld = false;
      break;
    }

    const newUnsavedMessages = zipMessagesAndAuthors({
      channelId: channel.id,
      users: authorUsers,
      messages: newDiscordMessages,
    });

    if (!newUnsavedMessages.length) {
      continue;
    }

    const createdMessages = await database.upsertMessages(newUnsavedMessages);

    for (const discordMessage of newDiscordMessages) {
      const dbMessage = createdMessages.find(
        (m) => m.discordId === discordMessage.id
      );

      if (!dbMessage) {
        continue;
      }

      await syncMessageAttachments({
        discordMessage,
        dbMessage,
      });
    }

    oldestMessageId =
      newUnsavedMessages[newUnsavedMessages.length - 1].discordId;

    await sleep(1000);
  }

  /* NEW MESSAGES */

  const newestMessage = await database.getNewestMessage(channel.id);
  let newestMessageId = newestMessage?.discordId;
  let isSyncingNew = true;

  while (isSyncingNew) {
    const newDiscordMessages = await discord.getMessages(channel.discordId, {
      afterId: newestMessageId,
    });

    if (!newDiscordMessages.length) {
      isSyncingNew = false;
      break;
    }

    const newUnsavedMessages = zipMessagesAndAuthors({
      channelId: channel.id,
      users: authorUsers,
      messages: newDiscordMessages,
    });

    if (!newUnsavedMessages.length) {
      continue;
    }

    const createdMessages = await database.upsertMessages(newUnsavedMessages);

    for (const discordMessage of newDiscordMessages) {
      const dbMessage = createdMessages.find(
        (m) => m.discordId === discordMessage.id
      );

      if (!dbMessage) {
        continue;
      }

      await syncMessageAttachments({
        discordMessage,
        dbMessage,
      });
    }

    newestMessageId =
      newUnsavedMessages[newUnsavedMessages.length - 1].discordId;

    await sleep(1000);
  }

  /* THREADS */

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

    if (!newUnsavedThreadMessages.length) {
      continue;
    }

    const createdThreadMessages = await database.upsertMessages(
      newUnsavedThreadMessages
    );

    for (const discordMessage of newDiscordThreadMessages) {
      const dbMessage = createdThreadMessages.find(
        (m) => m.discordId === discordMessage.id
      );

      if (!dbMessage) {
        continue;
      }

      await syncMessageAttachments({
        discordMessage,
        dbMessage,
      });
    }

    await sleep(1000);

    oldestThreadMessageId =
      newUnsavedThreadMessages[newUnsavedThreadMessages.length - 1].discordId;
  }
}

export async function syncMessageAttachments({
  discordMessage,
  dbMessage,
}: {
  discordMessage: DiscordMessage;
  dbMessage: Message;
}) {
  const newAttachments = [];
  for (const attachment of discordMessage.attachments) {
    const path = await syncImage(dbMessage.id, attachment);

    newAttachments.push({
      discordId: attachment.id,
      messageId: dbMessage.id,
      storagePath: path,
      width: attachment.width ?? null,
      height: attachment.height ?? null,
    });
  }

  if (newAttachments.length) {
    await database.upsertMessagesAttachments(newAttachments);
  }

  await database.updateMessage(dbMessage.id, {
    lastSyncedAt: new Date(),
  });
}

export async function syncImage(
  messageId: string,
  discordAttachment: DiscordMessageAttachment
) {
  const imageBuffer = await discord.downloadAttachment(discordAttachment);

  return storage.uploadFile({
    buf: imageBuffer,
    path: `message-attachments/${messageId}/${discordAttachment.filename}`,
  });
}

async function sleep(ms: number) {
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
            lastSyncedAt: null,
          },
        ]
      : [];
  });
}
