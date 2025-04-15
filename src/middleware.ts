import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const { pathname } = request.nextUrl;

  if (
    !sessionCookie &&
    pathname !== "/sign-in" &&
    pathname.startsWith("/admin")
  ) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (sessionCookie && pathname === "/sign-in") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  runtime: "nodejs",
  matcher: [
    "/",
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
