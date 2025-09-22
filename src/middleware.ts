import { type NextRequest, NextResponse } from "next/server";
import { auth } from "./utils/auth";
import { headers } from "next/headers";
import type { UserRole } from "@prisma/client";

export async function middleware(request: NextRequest) {
	const sessionCookie = await auth.api.getSession({
		headers: await headers(),
	});

	const pathname = request.nextUrl.pathname;

	if (sessionCookie) {
		switch (sessionCookie?.user.role as UserRole) {
			case "superadmin":
			case "admin":
			case "rssi":
			case "dpo":
			case "daj":
				if (
					!pathname.startsWith("/dashboard/admin") &&
					!pathname.startsWith("/dashboard/requests")
				) {
					return NextResponse.redirect(
						new URL("/dashboard/admin/requests", request.url),
					);
				}
				break;
			default:
				if (
					pathname.startsWith("/dashboard/admin") ||
					!pathname.startsWith("/dashboard")
				) {
					return NextResponse.redirect(
						new URL("/dashboard/requests", request.url),
					);
				}
				break;
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
