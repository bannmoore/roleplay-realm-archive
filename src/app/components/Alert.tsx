"use client";

import { useContext } from "react";
import { AlertContext } from "./AlertContext";

export default function Alert() {
  const { alert } = useContext(AlertContext);

  if (!alert) {
    return null;
  }

  switch (alert.variant) {
    case "error":
      return (
        <div
          className="bg-error-900 bg-opacity-75 border border-error-700 text-white px-4 py-3 rounded relative"
          role="alert"
        >
          {alert.message}
        </div>
      );
    case "success":
      return (
        <div
          className="bg-success-500 bg-opacity-50 border border-success-400 text-white px-4 py-3 rounded relative"
          role="alert"
        >
          {alert.message}
        </div>
      );
    default:
      return null;
  }
}
