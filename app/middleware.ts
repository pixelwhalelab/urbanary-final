import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

const authPages = [
  "/login",
  "/signup",
  "/verify-email",
  "/forgot-password",
  "/resend-verification-email",
];

const protectedPages = ["/dashboard", "/profile", "/account", "/favorites"];

export function middleware(req: NextRequest) {
  const token = req.cookies.get("login-token")?.value || null;
  const { pathname } = req.nextUrl;

  let isLoggedIn = false;
  if (token) {
    try {
      jwt.verify(token, JWT_SECRET);
      isLoggedIn = true;
    } catch {
      isLoggedIn = false;
    }
  }
    console.log("Middleware pathname:", pathname, "LoggedIn:", isLoggedIn);


  if (pathname === "/reset-password" || pathname.startsWith("/reset-password/")) {
    if (isLoggedIn) return NextResponse.redirect(new URL("/search", req.url)); 
    return NextResponse.next(); 
  }

  
  if (isLoggedIn && authPages.includes(pathname)) {
    return NextResponse.redirect(new URL("/search", req.url));
  }

  if (!isLoggedIn && protectedPages.some((page) => pathname.startsWith(page))) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}


export const config = {
  matcher: [
    "/login",
    "/signup",
    "/verify-email",
    "/forgot-password",
    "/reset-password",       
    "/reset-password/:token*",
    "/resend-verification-email",
    "/dashboard/:path*",
    "/profile/:path*",
    "/account/:path*",
    "/favorites/:path*",
  ],
};
