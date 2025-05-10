"use client";

import { MessageWithDisplayData } from "@/clients/database";
import { getThreadMessages } from "./actions";
import { useState } from "react";
import MessageContent from "./MessageContent";
import Attachment from "./Attachment";
interface MessageCardProps {
  message: MessageWithDisplayData;
}

export default function ExpandableMessageCard({ message }: MessageCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [threadMessages, setThreadMessages] = useState<
    MessageWithDisplayData[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (isExpanded) {
      setIsExpanded(false);
      return;
    }

    setIsLoading(true);
    try {
      const messages = await getThreadMessages(message.id.toString());
      setThreadMessages(messages);
      setIsExpanded(true);
    } catch (error) {
      console.error("Failed to fetch thread messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-4">
      <div className="card" onClick={handleClick}>
        <div className="flex mb-2">
          <span className="flex-1">{message.authorUsername}</span>
          <span>
            {message.discordPublishedAt.toDateString()}{" "}
            {message.discordPublishedAt.toLocaleTimeString()}
          </span>
        </div>
        {message.attachments.map((attachment) => (
          <div className="p-4" key={attachment.id}>
            <Attachment attachment={attachment} />
          </div>
        ))}
        <MessageContent message={message} />
        {message.isThread && (
          <div className="mt-2 text-sm text-gray-400">
            {isLoading
              ? "Loading thread..."
              : isExpanded
              ? "Hide thread"
              : "Show thread"}
          </div>
        )}
      </div>

      {isExpanded && threadMessages.length > 0 && (
        <div className="ml-6 mt-2 border-l-2 border-darkpurple-500 pl-4">
          {threadMessages.map((threadMessage) => (
            <div
              key={threadMessage.id}
              className="mb-2 bg-darkpurple-800 p-3 border border-darkpurple-600 shadow-sm rounded-lg"
            >
              <div className="flex mb-1 text-sm">
                <span className="flex-1">{threadMessage.authorUsername}</span>
                <span className="text-xs">
                  {threadMessage.discordPublishedAt.toDateString()}{" "}
                  {threadMessage.discordPublishedAt.toLocaleTimeString()}
                </span>
              </div>
              {threadMessage.attachments.map((attachment) => (
                <div className="p-4" key={attachment.id}>
                  <Attachment attachment={attachment} />
                </div>
              ))}
              <MessageContent message={threadMessage} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
