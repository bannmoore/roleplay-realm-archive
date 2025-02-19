"use client";

import { useState } from "react";
import { refreshServers } from "./actions";

export function RefreshServersButton() {
  const [loading, setLoading] = useState(false);
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
      {loading && <div>Working, please wait...</div>}

      <button
        className="mt-4"
        type="button"
        onClick={async () => {
          // TODO: Pop warning before refresh.
          setError("");
          setSuccess(false);
          setLoading(true);
          await refreshServers()
            .then(() => setSuccess(true))
            .catch((err) => {
              // https://kentcdodds.com/blog/get-a-catch-block-error-message-with-typescript
              let message = "Unknown Error";
              if (err instanceof Error) message = err.message;

              setError(message);
            })
            .finally(() => setLoading(false));
        }}
      >
        Refresh Server List
      </button>
    </>
  );
}
