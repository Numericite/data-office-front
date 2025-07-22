import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

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
		return NextResponse.redirect(new URL("/admin/requests", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		"/",
		"/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
	],
};
