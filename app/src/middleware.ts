import { NextRequest, NextResponse } from "next/server";

import { auth } from "./auth";
export default auth(async (_request: NextRequest) => {
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
