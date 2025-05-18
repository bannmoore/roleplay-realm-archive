"use client";

import { MessageAttachment } from "@/clients/database";
import { useEffect, useState } from "react";
import { getPresignedUrl } from "./actions";

export default function Attachment({
  attachment,
}: {
  attachment: MessageAttachment;
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchPresignedUrl = async () => {
      const url = await getPresignedUrl(attachment.storagePath);
      setImageUrl(url);
    };
    fetchPresignedUrl();
  }, [attachment.storagePath]);

  if (!imageUrl) {
    return null;
  }

  // Ref: Next Image does not seem to function correctly in DO
  // https://github.com/vercel/next.js/discussions/34433
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageUrl}
      alt="Attachment"
      width={attachment.width ?? 500}
      height={attachment.height ?? 500}
      className="m-auto"
      onError={(e) => console.error("Failed to load attachment", e)}
    />
    // <Image
    //   src={imageUrl}
    //   alt="Attachment"
    //   width={attachment.width ?? 500}
    //   height={attachment.height ?? 500}
    //   className="m-auto"
    //   onError={(e) => console.error("Failed to load attachment", e)}
    // />
  );
}
