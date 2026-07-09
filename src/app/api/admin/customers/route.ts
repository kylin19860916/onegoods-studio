import { NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/admin-auth";
import { getAdminCustomers } from "@/lib/admin-sales";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ error: "Please log in to OneGoods CMS." }, { status: 401 });
  }

  const result = await getAdminCustomers();
  return NextResponse.json(result);
}
