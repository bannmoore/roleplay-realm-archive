"use client";

import { markdownToHtml } from "@/app/utils/markdown";
import { Message } from "@/clients/database";
import { useEffect, useState } from "react";

export default function MessageContent({ message }: { message: Message }) {
  const [content, setContent] = useState("");
  useEffect(() => {
    if (message.content) {
      setContent(markdownToHtml(message.content));
    }
  }, [message.content]);

  return (
    <p
      dangerouslySetInnerHTML={{ __html: content }}
      className="message-content"
    />
  );
}
