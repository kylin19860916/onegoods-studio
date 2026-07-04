import { NextRequest, NextResponse } from "next/server";

const ADMIN_COOKIE = "onegoods_admin_session";

function isAdminPath(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

function isAdminApi(pathname: string) {
  return pathname.startsWith("/api/admin/") && pathname !== "/api/admin/login";
}

function hasSession(request: NextRequest) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return false;
  return request.cookies.get(ADMIN_COOKIE)?.value === secret;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") {
    if (hasSession(request)) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  if (isAdminPath(pathname) && !hasSession(request)) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminApi(pathname) && !hasSession(request)) {
    return NextResponse.json({ error: "Please log in to OneGoods CMS." }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
};
