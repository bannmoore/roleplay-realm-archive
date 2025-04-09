"use client";

import React, { useState } from "react";
import { syncChannel } from "./actions";
import { Channel } from "@/clients/database";

export default function SyncChannelButton({ channel }: { channel: Channel }) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  return (
    <>
      {error && (
        <div
          className="bg-error-900 bg-opacity-75 border border-error-700 text-white px-4 py-3 rounded relative"
          role="alert"
        >
          Error: {error}
        </div>
      )}
      {success && (
        <div
          className="bg-success-500 bg-opacity-50 border border-success-400 text-white px-4 py-3 rounded relative"
          role="alert"
        >
          Servers updated successfully.
        </div>
      )}
      {isSyncing && <div>Syncing... this could take a while.</div>}
      <button
        type="button"
        onClick={async () => {
          setSuccess(false);
          setError("");
          setIsSyncing(true);

          await syncChannel({
            channelId: channel.id,
            channelDiscordId: channel.discordId,
            serverId: channel.serverId,
          })
            .then(() => setSuccess(true))
            .catch((err) => {
              // https://kentcdodds.com/blog/get-a-catch-block-error-message-with-typescript
              let message = "Unknown Error";
              if (err instanceof Error) message = err.message;

              setError(message);
            })
            .finally(() => setIsSyncing(false));
        }}
      >
        Sync Channel
      </button>
    </>
  );
}
