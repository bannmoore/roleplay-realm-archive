import { MessageWithDisplayData } from "@/clients/database";
import Image from "next/image";

interface MessageCardProps {
  message: MessageWithDisplayData;
}

export default function MessageCard({ message }: MessageCardProps) {
  return (
    <div className="mb-4 bg-darkpurple-900 p-4 border border-darkpurple-500 shadow-sm rounded-lg">
      <div className="flex mb-2">
        <span className="flex-1">{message.authorUsername}</span>
        <span>
          {message.discordPublishedAt.toDateString()}{" "}
          {message.discordPublishedAt.toLocaleTimeString()}
        </span>
      </div>
      {message.attachments.map((attachment) => (
        <div className="p-4" key={attachment.id}>
          <Image
            src={attachment.discordSourceUri}
            alt="Attachment"
            width={attachment.width ?? 500}
            height={attachment.height ?? 500}
            className="m-auto"
          />
        </div>
      ))}
      <p>{message.content}</p>
    </div>
  );
}
