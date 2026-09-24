import { NextResponse, type NextRequest } from "next/server";

/**
 * Keeps distributors signed in while they use the app: every visit to the
 * portal pushes the session cookie's expiry another 30 days out. The server
 * extends the stored session to match (see getAccount), so someone who opens
 * Suppli Afya every week never has to log in again on that phone.
 */
const COOKIE = "sa_session";
const DAYS = 30;

export function proxy(request: NextRequest) {
  const token = request.cookies.get(COOKIE)?.value;
  const res = NextResponse.next();
  if (token) {
    res.cookies.set(COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: request.nextUrl.protocol === "https:",
      path: "/",
      maxAge: DAYS * 86400,
    });
  }
  return res;
}

export const config = {
  matcher: ["/portal", "/portal/:path*"],
};
