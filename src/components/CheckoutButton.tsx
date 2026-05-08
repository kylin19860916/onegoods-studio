"use client";

import { useState } from "react";

declare global {
  interface Window {
    gtag?: (cmd: string, eventName: string, params?: Record<string, unknown>) => void;
  }
}

export function CheckoutButton({
  slug,
  priceUSD,
  name,
}: {
  slug: string;
  priceUSD: number;
  name: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setLoading(true);
    setError(null);

    if (typeof window.gtag === "function") {
      window.gtag("event", "begin_checkout", {
        currency: "USD",
        value: priceUSD,
        items: [{ item_id: slug, item_name: name, price: priceUSD, quantity: 1 }],
      });
    }

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, priceUSD, name }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Checkout failed");
      }
      const { url } = await res.json();
      if (url) window.location.href = url;
      else throw new Error("No checkout URL returned");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setLoading(false);
    }
  }

  if (priceUSD === 0) {
    return (
      <button
        disabled
        className="w-full px-6 py-4 bg-[color:var(--color-bg-elevated)] text-[color:var(--color-fg-muted)] font-medium rounded-full cursor-not-allowed"
      >
        即将上架
      </button>
    );
  }

  return (
    <>
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full px-6 py-4 bg-[color:var(--color-accent)] text-[color:var(--color-bg)] font-medium rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-wait"
      >
        {loading ? "正在跳转 Stripe..." : `加入购物车 · $${priceUSD} USD`}
      </button>
      {error && (
        <p className="text-red-400 text-sm mt-3">{error}</p>
      )}
    </>
  );
}

