"use client";

import { ReactNode, useEffect, useState } from "react";

export default function Debug({ children }: { children: ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  if (!process.env.NEXT_PUBLIC_ENABLE_DEBUG) {
    return null;
  }
  return <div>{children}</div>;
}
