"use client";

import { useState } from "react";
import { resyncMessages } from "./actions";

export default function ResyncMessagesButton({
  channelId,
  disabled,
}: {
  channelId: string;
  disabled: boolean;
}) {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleClick = async () => {
    setIsSyncing(true);
    await resyncMessages(channelId);
    setIsSyncing(false);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isSyncing || disabled}
    >
      {isSyncing ? "Syncing..." : "Sync"}
    </button>
  );
}
