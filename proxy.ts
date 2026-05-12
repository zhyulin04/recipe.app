import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { TOKEN_COOKIE, verifyToken } from "@/lib/auth";

const AUTH_PAGES = ["/login", "/register"];
const PROTECTED_PREFIXES = ["/recipes/create"];
const EDIT_RE = /^\/recipes\/[^/]+\/edit\/?$/;

function isProtected(pathname: string): boolean {
  if (PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return true;
  }
  return EDIT_RE.test(pathname);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  const session = token ? await verifyToken(token) : null;

  if (session && AUTH_PAGES.includes(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!session && isProtected(pathname)) {
    const url = new URL("/login", request.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/register", "/recipes/create", "/recipes/:id/edit"],
};
