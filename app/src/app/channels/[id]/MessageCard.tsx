import { MessageWithDisplayData } from "@/clients/database";
import Attachment from "./Attachment";
import MarkdownContent from "@/app/components/MarkdownContent";
interface MessageCardProps {
  message: MessageWithDisplayData;
}

export default function MessageCard({ message }: MessageCardProps) {
  return (
    <div className="mb-4 card">
      <div className="flex mb-2">
        <span className="flex-1">{message.authorUsername}</span>
        <span suppressHydrationWarning>
          {message.discordPublishedAt.toDateString()}{" "}
          {message.discordPublishedAt.toLocaleTimeString()}
        </span>
      </div>
      {message.attachments.map((attachment) => (
        <div className="p-4" key={attachment.id}>
          <Attachment attachment={attachment} />
        </div>
      ))}
      {message.content && <MarkdownContent content={message.content} />}
    </div>
  );
}
