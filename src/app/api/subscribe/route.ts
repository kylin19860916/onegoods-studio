import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: Request) {
  const resendKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  if (!resendKey) {
    return NextResponse.json(
      { error: "RESEND_API_KEY not configured" },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const resend = new Resend(resendKey);

    if (audienceId) {
      // 加入 Resend audience（newsletter list）
      await resend.contacts.create({
        email,
        audienceId,
        unsubscribed: false,
      });
    } else {
      console.warn(
        "[subscribe] RESEND_AUDIENCE_ID not set - saving locally not implemented yet"
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[subscribe]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}
