import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";
import type { NextAuthRequest } from "next-auth";
import type { NextRequest } from "next/server";

// ── Rate limiter (in-memory sliding window, per edge isolate) ──
const hits = new Map<string, number[]>();
const WINDOW_MS = 60_000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < 30_000) return;
  lastCleanup = now;
  const cutoff = now - WINDOW_MS;
  for (const [key, timestamps] of hits) {
    const valid = timestamps.filter((t) => t > cutoff);
    if (valid.length === 0) hits.delete(key);
    else hits.set(key, valid);
  }
}

function isRateLimited(key: string, limit: number): boolean {
  cleanup();
  const now = Date.now();
  const cutoff = now - WINDOW_MS;
  const timestamps = (hits.get(key) ?? []).filter((t) => t > cutoff);
  if (timestamps.length >= limit) return true;
  timestamps.push(now);
  hits.set(key, timestamps);
  return false;
}

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

function rateLimitApi(req: NextRequest): NextResponse | null {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith("/api/")) return null;
  if (pathname.includes("health") || pathname.includes("cron")) return null;

  const ip = getClientIp(req);
  const bucket = pathname.startsWith("/api/auth") ? "auth" : pathname.startsWith("/api/webhooks") ? "webhook" : "api";
  const limit = bucket === "auth" ? 20 : bucket === "webhook" ? 120 : 60;

  if (isRateLimited(`${ip}:${bucket}`, limit)) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }
  return null;
}

// ── Auth middleware ──
const { auth } = NextAuth(authConfig);

export default auth((req: NextAuthRequest) => {
  const { pathname } = req.nextUrl;

  // Rate limit API routes
  const blocked = rateLimitApi(req as unknown as NextRequest);
  if (blocked) return blocked;

  const isLoggedIn = !!req.auth;
  const role = (req.auth?.user as { role?: string } | undefined)?.role;

  if ((pathname.startsWith("/dashboard") || pathname.startsWith("/curso")) && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) return NextResponse.redirect(new URL("/login", req.url));
    if (role !== "ADMIN") return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if ((pathname === "/login" || pathname === "/registro") && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
});

export const config = {
  matcher: ["/dashboard/:path*", "/curso/:path*", "/admin/:path*", "/login", "/registro", "/api/:path*"],
};
