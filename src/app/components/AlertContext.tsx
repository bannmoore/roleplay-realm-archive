"use client";

import { createContext, useState } from "react";

type Alert = {
  message: string;
  variant: "error" | "success";
};

export const AlertContext = createContext<{
  alert: Alert | null;
  setAlert: (alert: Alert | null) => void;
}>({
  alert: null,
  setAlert: () => {},
});

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [alert, setAlert] = useState<Alert | null>(null);

  return (
    <AlertContext.Provider value={{ alert, setAlert }}>
      {children}
    </AlertContext.Provider>
  );
}
