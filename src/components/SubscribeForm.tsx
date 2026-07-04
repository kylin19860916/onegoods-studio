"use client";

import { useState } from "react";

export function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
          订阅成功
        </p>
        <p className="text-xs text-[color:var(--color-fg-muted)]">
          首批购买入口开放时会通知你。
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-2 text-sm font-semibold">
        邮箱
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
        {state === "loading" ? "正在订阅" : "通知我上新"}
      </button>
      {state === "error" && (
        <p className="text-xs font-semibold text-red-700">
          {errorMsg ?? "订阅失败，请稍后再试。"}
        </p>
      )}
    </form>
  );
}
