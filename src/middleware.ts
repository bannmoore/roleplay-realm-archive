import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import discord from "./api/discord-client";

export default async function middleware(req: NextRequest) {
  const token = (await cookies()).get("token")?.value;
  if (!token) {
    discord.setUserToken(null);
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (!discord.hasUserToken()) {
    discord.setUserToken(token);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - login or auth
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!login|auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
