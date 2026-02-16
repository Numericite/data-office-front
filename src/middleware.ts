import { type NextRequest, NextResponse } from "next/server";
import { auth } from "./utils/auth";
import { headers } from "next/headers";

export async function middleware(request: NextRequest) {
	const sessionCookie = await auth.api.getSession({
		headers: await headers(),
	});

	const pathname = request.nextUrl.pathname;

	if (sessionCookie) {
		if (!pathname.startsWith("/dashboard")) {
			return NextResponse.redirect(new URL("/dashboard/requests", request.url));
		}
	} else {
		if (pathname.startsWith("/dashboard")) {
			return NextResponse.redirect(new URL("/", request.url));
		}
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
