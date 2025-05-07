import { MessageWithDisplayData } from "@/clients/database";
import Image from "next/image";
import MessageContent from "./MessageContent";
interface MessageCardProps {
  message: MessageWithDisplayData;
}

export default function MessageCard({ message }: MessageCardProps) {
  return (
    <div className="mb-4 card">
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
      <MessageContent message={message} />
    </div>
  );
}
