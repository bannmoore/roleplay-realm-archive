"use client";

import { createContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

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
  const pathname = usePathname();

  useEffect(() => {
    setAlert(null);
  }, [pathname]);

  return (
    <AlertContext.Provider value={{ alert, setAlert }}>
      {children}
    </AlertContext.Provider>
  );
}
