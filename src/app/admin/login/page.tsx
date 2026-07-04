"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("KYLIN1986@gmail.com");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("请输入 OneGoods CMS 管理员账号。");

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("正在登录...");
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error ?? "登录失败。");
      return;
    }
    const nextPath = new URLSearchParams(window.location.search).get("next") || "/admin";
    router.push(nextPath);
    router.refresh();
  }

  return (
    <main className="mx-auto grid min-h-[calc(100dvh-64px)] max-w-[1100px] grid-cols-1 items-center gap-10 px-6 py-12 lg:grid-cols-[0.85fr_1.15fr]">
      <section>
        <p className="mb-4 text-sm font-semibold text-[color:var(--color-accent)]">OneGoods CMS</p>
        <h1 className="font-display mb-5">管理员登录</h1>
        <p className="max-w-[56ch] leading-relaxed text-[color:var(--color-fg-muted)]">
          登录后可以进入后台中心，管理商品库、上架状态、价格和购买渠道。
        </p>
      </section>

      <form onSubmit={login} className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-white/82 p-6 shadow-[var(--shadow-card)] md:p-8">
        <label className="mb-5 block">
          <span className="mb-2 block text-sm font-semibold">邮箱</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="min-h-12 w-full rounded-[0.9rem] border border-[color:var(--color-border)] bg-white px-4 outline-none focus:border-[color:var(--color-accent)]"
            required
          />
        </label>
        <label className="mb-6 block">
          <span className="mb-2 block text-sm font-semibold">密码</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="min-h-12 w-full rounded-[0.9rem] border border-[color:var(--color-border)] bg-white px-4 outline-none focus:border-[color:var(--color-accent)]"
            required
          />
        </label>
        <button type="submit" className="primary-cta w-full">
          登录 CMS
        </button>
        <p className="mt-5 text-sm text-[color:var(--color-fg-muted)]">{message}</p>
      </form>
    </main>
  );
}
