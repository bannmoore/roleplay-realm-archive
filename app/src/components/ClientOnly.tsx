"use client";

// Swiped from: https://www.joshwcomeau.com/react/the-perils-of-rehydration/
/**
 * Used to avoid rehydration errors with the React-Select integrated components.
 */
import { ReactNode, useEffect, useState } from "react";

export default function ClientOnly({
  children,
  ...delegated
}: {
  children: ReactNode;
}) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return <div {...delegated}>{children}</div>;
}
