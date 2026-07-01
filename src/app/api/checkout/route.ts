import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getProductBySlug } from "@/lib/content";

// 配送范围：澳洲 + 中国大陆 + 港澳台
const ALLOWED_COUNTRIES: NonNullable<
  Stripe.Checkout.Session["shipping_address_collection"]
>["allowed_countries"] = [
  "AU",
  "CN",
  "HK",
  "MO",
  "TW",
];

export async function POST(req: Request) {
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret) {
    return NextResponse.json(
      { error: "STRIPE_SECRET_KEY not configured" },
      { status: 500 }
    );
  }

  const stripe = new Stripe(stripeSecret);

  try {
    const body = await req.json();
    const slug = body.slug as string;
    const product = getProductBySlug(slug);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (product.priceUSD <= 0) {
      return NextResponse.json(
        { error: "Product not yet available for purchase" },
        { status: 400 }
      );
    }

    const origin =
      req.headers.get("origin") ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://onegoods-studio.vercel.app";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd", // base currency; Stripe Adaptive Pricing 会按 IP 自动转换
            product_data: {
              name: product.name,
              description: product.shortDesc,
              images: product.images?.map((img) =>
                img.startsWith("http") ? img : `${origin}${img}`
              ),
            },
            unit_amount: Math.round(product.priceUSD * 100), // cents
          },
          quantity: 1,
        },
      ],
      // 配送地址收集（限制国家）
      shipping_address_collection: {
        allowed_countries: ALLOWED_COUNTRIES,
      },
      // 支持多语言
      locale: "auto",
      success_url: `${origin}/shop/${slug}?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/shop/${slug}?status=cancelled`,
      metadata: {
        product_slug: slug,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[checkout]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}

