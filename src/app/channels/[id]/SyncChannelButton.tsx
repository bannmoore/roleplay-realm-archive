"use client";

import React, { useContext, useState } from "react";
import { syncChannelAction } from "./actions";
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

        await syncChannelAction(channel)
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
