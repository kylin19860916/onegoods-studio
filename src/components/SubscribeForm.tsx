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
      <div className="px-4 py-6 bg-[color:var(--color-bg-elevated)] border border-[color:var(--color-accent)] rounded-2xl text-center">
        <p className="text-[color:var(--color-accent)] text-sm font-medium mb-1">
          ✓ 订阅成功
        </p>
        <p className="text-xs text-[color:var(--color-fg-muted)]">
          下一封邮件见。
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        disabled={state === "loading"}
        className="px-4 py-3 bg-[color:var(--color-bg-elevated)] border border-[color:var(--color-border)] rounded-full focus:outline-none focus:border-[color:var(--color-accent)] transition-colors disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={state === "loading"}
        className="px-6 py-3 bg-[color:var(--color-accent)] text-[color:var(--color-bg)] font-medium rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-wait"
      >
        {state === "loading" ? "提交中..." : "订阅"}
      </button>
      {state === "error" && (
        <p className="text-red-400 text-xs">{errorMsg}</p>
      )}
    </form>
  );
}

