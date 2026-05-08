"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";

declare global {
  interface Window {
    gtag?: (cmd: string, eventName: string, params?: Record<string, unknown>) => void;
  }
}

function PurchaseTrackerInner({
  slug,
  priceUSD,
  name,
}: {
  slug: string;
  priceUSD: number;
  name: string;
}) {
  const sp = useSearchParams();

  useEffect(() => {
    const status = sp.get("status");
    const sessionId = sp.get("session_id");
    if (status === "success" && sessionId && typeof window.gtag === "function") {
      window.gtag("event", "purchase", {
        transaction_id: sessionId,
        currency: "USD",
        value: priceUSD,
        items: [
          {
            item_id: slug,
            item_name: name,
            price: priceUSD,
            quantity: 1,
          },
        ],
      });
    }
  }, [sp, slug, priceUSD, name]);

  return null;
}

export function PurchaseTracker(props: { slug: string; priceUSD: number; name: string }) {
  return (
    <Suspense fallback={null}>
      <PurchaseTrackerInner {...props} />
    </Suspense>
  );
}
