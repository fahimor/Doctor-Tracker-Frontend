import { decodeJwt, jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Route protection (runs before any page renders).
 *
 * The session JWT lives in an httpOnly cookie that the backend sets through
 * the `/api` rewrite, so it is visible here on the frontend's domain.
 *  - If `JWT_SECRET` is configured on the frontend, the signature is verified.
 *  - Otherwise we only check that a non-expired token is present; the backend
 *    still verifies every API call, so this is purely a UX gate.
 */
const COOKIE_NAME = process.env.SESSION_COOKIE_NAME ?? "dt_session";
const PUBLIC_ROUTES = ["/login"];

async function isSessionValid(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const secret = process.env.JWT_SECRET;
    if (secret) {
      await jwtVerify(token, new TextEncoder().encode(secret), {
        algorithms: ["HS256"],
        issuer: "doctor-tracker-api",
        audience: "doctor-tracker-web",
      });
      return true;
    }
    const { exp } = decodeJwt(token);
    return typeof exp !== "number" || exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const authenticated = await isSessionValid(token);
  const isPublic = PUBLIC_ROUTES.includes(pathname);

  if (!authenticated && !isPublic) {
    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/") loginUrl.searchParams.set("next", pathname + search);
    const response = NextResponse.redirect(loginUrl);
    if (token) response.cookies.delete(COOKIE_NAME); // clear an expired/invalid token
    return response;
  }

  if (authenticated && (isPublic || pathname === "/")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Everything except the API proxy, Next.js internals and static files.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt)$).*)"],
};
