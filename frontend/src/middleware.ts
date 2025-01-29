import { NextRequest, NextResponse } from "next/server";
import { cookies } from 'next/headers'

// 1. Specify protected and public routes
const publicRoutes = ["/sign-in", "/sign-up"];

// Auth middleware
export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isPublicRoute = publicRoutes.includes(path);
  
  console.debug(req.cookies);
  const cookie = (await cookies()).get('isLoggedIn')?.value;
  console.debug(cookie);

  // 4. Redirect to /login if the user is not authenticated
  if (!isPublicRoute && cookie !== "true") {
    return NextResponse.redirect(new URL("/sign-in", req.nextUrl));
  }

  return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
