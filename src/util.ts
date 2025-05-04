import { NextResponse } from "next/server";
import { config } from "./config";
import { auth } from "./auth";
import database from "./clients/database";

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

/** Returns the database user if currently logged in, otherwise undefined */
export async function checkAuthenticated() {
  let user = undefined;
  const session = await auth();

  if (session?.user?.id) {
    user = await database.getUser(session?.user?.id);
  }

  return user;
}
