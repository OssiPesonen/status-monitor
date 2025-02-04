import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// 1. Specify protected and public routes
const publicRoutes = ["/sign-in", "/sign-up"];

// Auth middleware
export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isPublicRoute = publicRoutes.includes(path);

  // Allow access right off
  if (isPublicRoute) {
    return NextResponse.next();
  }

  const cookieKey = "status-monitor-loggedin";

  const cookieStore = await cookies();
  const cookie = cookieStore.get(cookieKey)?.value;

  if (!cookie) {
    // Check user auth status from API
    const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "/user/profile", {
      headers: { Cookie: cookieStore.toString() },
      method: "GET",
    });

    if (response.ok) {
      const now = new Date();
      (await cookies()).set(cookieKey, "1", {
        expires: now.setMinutes(now.getMinutes() + 10),
      });
      // Todo: 
    } else {
      console.debug("redirecting");
      return NextResponse.redirect(new URL("/sign-in", req.nextUrl));
    }
  }

  // Verify the cookie
  if (!isPublicRoute && cookie !== "1") {
    return NextResponse.redirect(new URL("/sign-in", req.nextUrl));
  }

  return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
