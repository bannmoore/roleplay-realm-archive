"use client";

import { useContext, useState } from "react";
import { refreshServers } from "./actions";
import { AlertContext } from "../components/AlertContext";

export function SyncServersButton() {
  const [isSyncing, setIsSyncing] = useState(false);
  const { setAlert } = useContext(AlertContext);

  return (
    <button
      type="button"
      disabled={isSyncing}
      onClick={async () => {
        setAlert(null);
        setIsSyncing(true);

        await refreshServers()
          .then(() =>
            setAlert({ message: "Server list synced", variant: "success" })
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
      Sync servers
    </button>
  );
}
