import {
	type NextFetchEvent,
	type NextRequest,
	NextResponse,
} from "next/server";
import type { CustomMiddleware } from "./chain";

interface SettingsResponse {
	registrationOpen: boolean;
}

export function installationMiddleware(
	middleware: CustomMiddleware,
): CustomMiddleware {
	return async (
		request: NextRequest,
		event: NextFetchEvent,
		response: NextResponse,
	) => {
		const path = request.nextUrl.pathname;
		if (path === "/install") {
			const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`);

			if (res.ok) {
				const body: SettingsResponse = await res.json();

				if (body.registrationOpen) {
					// Allow access to install flow
					return middleware(request, event, response);
				}

				// Do not allow access to installation flow
				return NextResponse.redirect(new URL("/sign-in", request.nextUrl));
			}
		}

		return middleware(request, event, response);
	};
}
