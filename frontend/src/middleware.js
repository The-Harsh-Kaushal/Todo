import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("refresh_token");

  if (!token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*"], // protect these routes
};
