import { NextResponse } from "next/server";
import { config } from "./config";

/**
 * Returns a redirect response for the configured BaseUrl + Path.
 * Avoids the "0.0.0.0" host issue inside a Docker container.
 * Ref: https://github.com/vercel/next.js/issues/54450
 */
export function redirect(path: string) {
  return NextResponse.redirect(new URL(path, config.baseUrl), {
    status: 302,
  });
}
