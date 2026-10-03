import { NextResponse, type NextRequest } from "next/server";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  SESSION_MAX_AGE_REMEMBER,
  SESSION_REFRESH_THRESHOLD,
  SESSION_REFRESH_THRESHOLD_REMEMBER,
} from "@/lib/constants";
import { inspectSessionToken, signSessionToken } from "@/lib/jwt";
import {
  burstLimit,
  canonicalRedirect,
  isBlockedRequest,
  isSearchBot,
} from "@/lib/edge-guard";

const isProd = process.env.NODE_ENV === "production";

function clientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const method = req.method;

  // 1. Drop obviously hostile probes and disallowed methods.
  if (isBlockedRequest(pathname, method)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // 2. Force HTTPS + a single canonical host in production.
  const redirectTo = canonicalRedirect({
    proto: req.headers.get("x-forwarded-proto"),
    host: req.headers.get("host") ?? "",
    pathname,
    search,
    canonicalHost: process.env.NEXT_PUBLIC_CANONICAL_HOST,
    redirectHosts: (process.env.NEXT_PUBLIC_REDIRECT_HOSTS ?? "")
      .split(",")
      .map((h) => h.trim())
      .filter(Boolean),
    isProd,
  });
  if (redirectTo) return NextResponse.redirect(redirectTo, 308);

  // 3. Per-IP burst limiter (single-instance; mirror with the Vercel WAF).
  // Recognized search engine bots (Googlebot, Bingbot) receive a generous ceiling
  // so rapid multi-asset indexing passes are never throttled with HTTP 429.
  const ua = req.headers.get("user-agent") ?? "";
  const isBot = isSearchBot(ua);
  const burst = burstLimit(clientIp(req), isBot ? 2000 : 120);
  if (!burst.ok) {
    return new NextResponse("Too Many Requests", {
      status: 429,
      headers: { "Retry-After": String(burst.retryAfterSec) },
    });
  }

  // Pass the path (and edge geo, if present) to downstream handlers.
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", pathname);
  const country = req.headers.get("x-vercel-ip-country");
  if (country) requestHeaders.set("x-geo-country", country);

  const res = NextResponse.next({ request: { headers: requestHeaders } });

  // 4. Admin area: gate everything except the login page itself.
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = req.cookies.get(SESSION_COOKIE)?.value;
    const { valid, exp, remember } = await inspectSessionToken(token);

    if (!valid) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }

    // Sliding session: re-issue when close to expiry, keeping the
    // "remember me" lifetime if that's what the visitor chose.
    const secondsLeft = exp ? exp - Math.floor(Date.now() / 1000) : 0;
    const maxAge = remember ? SESSION_MAX_AGE_REMEMBER : SESSION_MAX_AGE;
    const threshold = remember
      ? SESSION_REFRESH_THRESHOLD_REMEMBER
      : SESSION_REFRESH_THRESHOLD;
    if (secondsLeft > 0 && secondsLeft < threshold) {
      res.cookies.set(SESSION_COOKIE, await signSessionToken(maxAge, remember), {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        path: "/",
        maxAge,
      });
    }
  }

  return res;
}

export const config = {
  matcher: [
    // Everything except Next internals and static asset file types.
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|webp|avif|svg|ico|woff2?|ttf|mp4|webm)$).*)",
  ],
};
