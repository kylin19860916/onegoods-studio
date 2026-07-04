import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, getAdminConfig, isAdminConfigured, verifyAdminCredentials } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "Admin login is not configured." }, { status: 503 });
  }

  const { email, password } = await request.json();
  if (!verifyAdminCredentials(String(email ?? ""), String(password ?? ""))) {
    return NextResponse.json({ error: "邮箱或密码不正确。" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, getAdminConfig().sessionSecret, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
  return response;
}
