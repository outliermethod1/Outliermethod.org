import { NextResponse } from "next/server";
import { MAINTENANCE_MODE } from "./lib/config";

export function middleware(request) {
  if (!MAINTENANCE_MODE) return NextResponse.next();

  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/maintenance") || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  return NextResponse.rewrite(new URL("/maintenance", request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg).*)"],
};
