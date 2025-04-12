import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import type { CustomMiddleware } from "./chain";

const publicRoutes = ["/sign-in", "/sign-up", "/install"];

export function authMiddleware(middleware: CustomMiddleware): CustomMiddleware {
	return async (
		request: NextRequest,
		event: NextFetchEvent,
		response: NextResponse,
	) => {
		// Checks which path user is trying to enter and ensures routes are protected
		const path = request.nextUrl.pathname;
		const isPublicRoute = publicRoutes.includes(path);

		const cookieKey = "status-monitor-loggedin";
		const cookieStore = await cookies();
		const cookie = cookieStore.get(cookieKey)?.value;

		if (!cookie) {
			// Not logged in and attempting to access public route
			if (isPublicRoute) {
				return NextResponse.next();
			}

			// Attempting to access protected route
			// Check user auth status from API
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/user/profile`,
				{
					headers: { Cookie: cookieStore.toString() },
					method: "GET",
				},
			);

			if (response.ok) {
				// Create a superficial cookie for the browser so we don't try to hit
				// the API on every page request. This expires in 10 minutes.
				const now = new Date();
				(await cookies()).set(cookieKey, "1", {
					expires: now.setMinutes(now.getMinutes() + 10),
				});
			} else {
				// Unable to get auth session from API, ask user to sign in
				return NextResponse.redirect(new URL("/sign-in", request.nextUrl));
			}
		}

		// Attempting to sign out, remove the "session" cookie we set here for auth
		if (path === "/sign-out") {
			cookieStore.delete(cookieKey);
			return NextResponse.next();
		}

		// Verify the cookie
		if (!isPublicRoute && cookie !== "1") {
			return NextResponse.redirect(new URL("/sign-in", request.nextUrl));
		}
		
		if (isPublicRoute) {
			// In case of a public route (sign in etc) just redirect user to dashboard
			return NextResponse.redirect(new URL("/", request.nextUrl));
		}

		return middleware(request, event, response);
	};
}
