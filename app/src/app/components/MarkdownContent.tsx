"use client";

import { markdownToHtml } from "@/app/utils/markdown";
import { useEffect, useState } from "react";

export default function MarkdownContent({ content }: { content: string }) {
  const [html, setHtml] = useState("");
  useEffect(() => {
    if (content) {
      setHtml(markdownToHtml(content));
    }
  }, [content]);

  return (
    <p dangerouslySetInnerHTML={{ __html: html }} className="message-content" />
  );
}
