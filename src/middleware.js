import { NextResponse } from "next/server";

// Middleware function
export function middleware(request) {
  const url = new URL(request.url);
  const path = request.nextUrl.pathname;

  const xpdx = request.cookies.get("xpdx")?.value; // Auth token
  const xpdx_r = request.cookies.get("xpdx_r")?.value; // Role
  const xpdx_s = request.cookies.get("xpdx_s")?.value; // Status

  const dashboardPaths = new Set(["/dashboard"]);
  const adminOnlyPaths = new Set(["/", "/users"]);
  const authPaths = new Set(["/auth/register", "/auth/login"]);
  const restrictedStatuses = ["deactive"]; // Adjust if needed

  const protectedRoutes = [
    ...dashboardPaths,
    "/order/",
    "/product/",
    "/customer/",
    "/invoicing/",
    "/system-setup/",
  ];

  const isProtected = protectedRoutes.some((route) => path.startsWith(route));

  // ✅ Always allow /dashboard to break redirect loops
  if (path === "/dashboard") {
    return NextResponse.next();
  }

  // 🚫 If user is restricted (e.g., deactive), redirect them to dashboard
  if (xpdx_s && restrictedStatuses.includes(xpdx_s)) {
    return NextResponse.redirect(new URL("/dashboard", url));
  }

  // 🔐 Redirect non-Admin users away from admin-only paths
  if (adminOnlyPaths.has(path) && xpdx_r !== "Admin") {
    return NextResponse.redirect(new URL("/dashboard", url));
  }

  // 🔁 Redirect logged-in users away from login/register pages
  if (xpdx && authPaths.has(path)) {
    return NextResponse.redirect(new URL("/dashboard", url));
  }

  // 🔒 Redirect guests or restricted users from protected routes
  if ((!xpdx || restrictedStatuses.includes(xpdx_s)) && isProtected) {
    return NextResponse.redirect(new URL("/", url));
  }

  return NextResponse.next();
}

// Configuration for the middleware matcher
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)", // Exclude static files
    "/order/:path*", // Dynamic route patterns
    "/product/:path*",
  ],
};
