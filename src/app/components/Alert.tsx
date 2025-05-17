"use client";

import { ReactNode, useContext } from "react";
import { AlertContext } from "./AlertContext";

export default function Alert() {
  const { alert } = useContext(AlertContext);

  if (!alert) {
    return null;
  }

  switch (alert.variant) {
    case "error":
      return <AlertError>{alert.message}</AlertError>;
    case "success":
      return <AlertSuccess>{alert.message}</AlertSuccess>;
    default:
      return null;
  }
}

export function AlertError({ children }: { children: ReactNode }) {
  return (
    <div
      className="bg-error-900 bg-opacity-75 border border-error-700 text-white px-4 py-3 rounded relative"
      role="alert"
    >
      {children}
    </div>
  );
}

export function AlertSuccess({ children }: { children: ReactNode }) {
  return (
    <div
      className="bg-success-500 bg-opacity-50 border border-success-400 text-white px-4 py-3 rounded relative"
      role="alert"
    >
      {children}
    </div>
  );
}

export function AlertInfo({ children }: { children: ReactNode }) {
  return (
    <div
      className="bg-blue-700 bg-opacity-75 border border-blue-700 text-white px-4 py-3 rounded relative"
      role="alert"
    >
      {children}
    </div>
  );
}
