"use client";

import { Message } from "@/clients/database";
import { getThreadMessages } from "./actions";
import { useState } from "react";

interface MessageCardProps {
  message: Message;
}

export default function ExpandableMessageCard({ message }: MessageCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [threadMessages, setThreadMessages] = useState<Message[]>([]);
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
      <div
        className="bg-darkpurple-900 p-4 border border-darkpurple-500 shadow-sm rounded-lg cursor-pointer hover:bg-darkpurple-800 transition-colors"
        onClick={handleClick}
      >
        <div className="flex mb-2">
          <span className="flex-1">{message.authorId}</span>
          <span>
            {message.discordPublishedAt.toDateString()}{" "}
            {message.discordPublishedAt.toLocaleTimeString()}
          </span>
        </div>
        <p>{message.content}</p>
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
                <span className="flex-1">{threadMessage.authorId}</span>
                <span className="text-xs">
                  {threadMessage.discordPublishedAt.toDateString()}{" "}
                  {threadMessage.discordPublishedAt.toLocaleTimeString()}
                </span>
              </div>
              <p className="text-sm">{threadMessage.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
