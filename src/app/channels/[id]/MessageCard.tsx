import { Message } from "@/clients/database";

interface MessageCardProps {
  message: Message;
}

export default function MessageCard({ message }: MessageCardProps) {
  return (
    <div className="mb-4 bg-darkpurple-900 p-4 border border-darkpurple-500 shadow-sm rounded-lg">
      <div className="flex mb-2">
        <span className="flex-1">{message.authorId}</span>
        <span>
          {message.discordPublishedAt.toDateString()}{" "}
          {message.discordPublishedAt.toLocaleTimeString()}
        </span>
      </div>
      <p>{message.content}</p>
    </div>
  );
}
