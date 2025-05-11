"use client";

import { useState } from "react";
import { resyncMessages } from "./actions";

export default function ResyncMessagesButton({
  channelId,
}: {
  channelId: string;
}) {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleClick = async () => {
    setIsSyncing(true);
    await resyncMessages(channelId);
    setIsSyncing(false);
  };

  return (
    <button type="button" onClick={handleClick} disabled={isSyncing}>
      {isSyncing ? "Syncing..." : "Sync"}
    </button>
  );
}
