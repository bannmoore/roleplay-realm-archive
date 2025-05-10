"use client";

import { MessageAttachment } from "@/clients/database";
import { useEffect, useState } from "react";
import Image from "next/image";
import { getPresignedUrl } from "./actions";

export default function Attachment({
  attachment,
}: {
  attachment: MessageAttachment;
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchPresignedUrl = async () => {
      if (attachment.sourceUri) {
        const url = await getPresignedUrl(attachment.sourceUri);
        setImageUrl(url);
      }
    };
    fetchPresignedUrl();
  }, [attachment.sourceUri]);

  if (!imageUrl) {
    return null;
  }

  return (
    <Image
      src={imageUrl}
      alt="Attachment"
      width={attachment.width ?? 500}
      height={attachment.height ?? 500}
      className="m-auto"
    />
  );
}
