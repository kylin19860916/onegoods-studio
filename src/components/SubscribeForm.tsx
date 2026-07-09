"use client";

import { useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";

export function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { t } = useI18n();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setErrorMsg(null);

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Subscribe failed");
      }

      setState("success");
      setEmail("");
    } catch (e) {
      setState("error");
      setErrorMsg(e instanceof Error ? e.message : "Unknown error");
    }
  }

  if (state === "success") {
    return (
      <div className="rounded-[1.25rem] border border-[color:var(--color-accent)] bg-white px-4 py-6 text-center">
        <p className="mb-1 text-sm font-semibold text-[color:var(--color-accent)]">
          {t("subscribe.successTitle")}
        </p>
        <p className="text-xs text-[color:var(--color-fg-muted)]">
          {t("subscribe.successBody")}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-2 text-sm font-semibold">
        {t("subscribe.email")}
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          disabled={state === "loading"}
          className="min-h-12 rounded-full border border-[color:var(--color-border)] bg-white px-4 py-3 font-normal transition-colors placeholder:text-[color:var(--color-fg-muted)] focus:border-[color:var(--color-accent)] focus:outline-none disabled:opacity-50"
        />
      </label>
      <button
        type="submit"
        disabled={state === "loading"}
        className="primary-cta disabled:cursor-wait disabled:opacity-50"
      >
        {state === "loading" ? t("subscribe.loading") : t("subscribe.submit")}
      </button>
      {state === "error" && (
        <p className="text-xs font-semibold text-red-700">
          {errorMsg ?? t("subscribe.error")}
        </p>
      )}
    </form>
  );
}
