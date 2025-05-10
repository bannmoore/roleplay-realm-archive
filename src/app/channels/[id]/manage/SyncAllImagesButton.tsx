"use client";

import { useState } from "react";
import { syncAllImages } from "./actions";

export default function SyncAllImagesButton({
  channelId,
}: {
  channelId: string;
}) {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleClick = async () => {
    setIsSyncing(true);
    await syncAllImages(channelId);
    setIsSyncing(false);
  };

  return (
    <button type="button" onClick={handleClick} disabled={isSyncing}>
      {isSyncing ? "Syncing..." : "Sync Images"}
    </button>
  );
}
