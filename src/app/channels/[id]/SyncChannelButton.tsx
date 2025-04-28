"use client";

import React, { useContext, useState } from "react";
import { syncChannel } from "./actions";
import { Channel } from "@/clients/database";
import { AlertContext } from "@/app/components/AlertContext";

export default function SyncChannelButton({ channel }: { channel: Channel }) {
  const [isSyncing, setIsSyncing] = useState(false);
  const { setAlert } = useContext(AlertContext);

  return (
    <button
      type="button"
      disabled={isSyncing}
      onClick={async () => {
        setAlert(null);
        setIsSyncing(true);

        await syncChannel({
          channelId: channel.id,
          channelDiscordId: channel.discordId,
          serverId: channel.serverId,
        })
          .then(() =>
            setAlert({ message: "Channel synced", variant: "success" })
          )
          .catch((err) => {
            // https://kentcdodds.com/blog/get-a-catch-block-error-message-with-typescript
            let message = "Unknown Error";
            if (err instanceof Error) message = err.message;

            setAlert({ message, variant: "error" });
          })
          .finally(() => setIsSyncing(false));
      }}
    >
      {isSyncing ? "Syncing..." : "Sync"}
    </button>
  );
}
