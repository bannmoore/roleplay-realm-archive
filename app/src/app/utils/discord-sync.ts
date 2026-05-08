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
  console.log(`Starting from oldest message ${oldestMessage?.discordId}...`);

  while (isSyncingOld) {
    console.log(`Fetching messages before ${oldestMessageId}...`);
    const newDiscordMessages = await discord.getMessages(channel.discordId, {
      beforeId: oldestMessageId,
    });

    if (!newDiscordMessages.length) {
      console.log("Done syncing old messages.");
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

    console.log("Persisting messages to database...");
    const createdMessages = await database.upsertMessages(newUnsavedMessages);

    for (const discordMessage of newDiscordMessages) {
      const dbMessage = createdMessages.find(
        (m) => m.discordId === discordMessage.id,
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

    console.log("Pausing before next loop...");
    await sleep(1000);
  }

  /* NEW MESSAGES */

  const newestMessage = await database.getNewestMessage(channel.id);
  let newestMessageId = newestMessage?.discordId;
  let isSyncingNew = true;
  console.log(`Starting from newest message ${newestMessageId}...`);

  while (isSyncingNew) {
    console.log(`Fetching messages after ${newestMessageId}`);
    const newDiscordMessages = await discord.getMessages(channel.discordId, {
      afterId: newestMessageId,
    });

    if (!newDiscordMessages.length) {
      console.log("Done syncing new messages.");
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

    console.log("Persisting messages to database...");
    const createdMessages = await database.upsertMessages(newUnsavedMessages);

    for (const discordMessage of newDiscordMessages) {
      const dbMessage = createdMessages.find(
        (m) => m.discordId === discordMessage.id,
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

    console.log("Pausing before next loop...");
    await sleep(1000);
  }

  /* THREADS */

  console.log("Checking for thread origins...");
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
    threadOrigin.id,
  );
  let oldestThreadMessageId = oldestThreadMessage?.discordId;
  let isSyncingThreadsOld = true;
  console.log(
    `Syncing thread ${threadOrigin.id} from oldest message ${oldestThreadMessageId}`,
  );

  while (isSyncingThreadsOld) {
    console.log(`Fetching messages after ${oldestThreadMessageId}`);
    const newDiscordThreadMessages = await discord.getThreadMessages(
      threadOrigin.discordId,
      {
        beforeId: oldestThreadMessageId,
      },
    );

    if (!newDiscordThreadMessages.length) {
      console.log("Done syncing thread old messages.");
      isSyncingThreadsOld = false;
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

    console.log("Persiting thread messages to database...");
    const createdThreadMessages = await database.upsertMessages(
      newUnsavedThreadMessages,
    );

    for (const discordMessage of newDiscordThreadMessages) {
      const dbMessage = createdThreadMessages.find(
        (m) => m.discordId === discordMessage.id,
      );

      if (!dbMessage) {
        continue;
      }

      await syncMessageAttachments({
        discordMessage,
        dbMessage,
      });
    }

    console.log("Pausing before next loop...");
    await sleep(1000);

    oldestThreadMessageId =
      newUnsavedThreadMessages[newUnsavedThreadMessages.length - 1].discordId;
  }

  const newestThreadMessage = await database.getNewestThreadMessage(
    threadOrigin.id,
  );
  let newestThreadMessageId = newestThreadMessage?.discordId;
  let isSyncingThreadsNew = true;

  while (isSyncingThreadsNew) {
    console.log(
      `Syncing thread ${threadOrigin.id} from newest message ${newestThreadMessageId}`,
    );
    const newDiscordThreadMessages = await discord.getThreadMessages(
      threadOrigin.discordId,
      {
        afterId: newestThreadMessageId,
      },
    );

    if (!newDiscordThreadMessages.length) {
      console.log("Done syncing thread old messages.");
      isSyncingThreadsNew = false;
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

    console.log("Persisting thread messages to database...");
    const createdThreadMessages = await database.upsertMessages(
      newUnsavedThreadMessages,
    );

    for (const discordMessage of newDiscordThreadMessages) {
      const dbMessage = createdThreadMessages.find(
        (m) => m.discordId === discordMessage.id,
      );

      if (!dbMessage) {
        continue;
      }

      await syncMessageAttachments({
        discordMessage,
        dbMessage,
      });
    }

    console.log("Pausing before next loop...");
    await sleep(1000);

    newestThreadMessageId =
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
    const path = await syncImage(dbMessage, attachment);

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
  message: Message,
  discordAttachment: DiscordMessageAttachment,
) {
  const imageBuffer = await discord.downloadAttachment(discordAttachment);

  return storage.uploadFile({
    buf: imageBuffer,
    path: `message-attachments/channel-${message.channelId}/message-${message.id}/${discordAttachment.id}-${discordAttachment.filename}`,
  });
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Trim whitespace and mentions (@username) from message content
function trimMessageContent(content?: string) {
  const trimmed = content?.trim() ?? "";

  if (trimmed.length < 10) {
    return "";
  }

  return content?.replaceAll(/<@[!0-9]+>/g, "").trim();
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
