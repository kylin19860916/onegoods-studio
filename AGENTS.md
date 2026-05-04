<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# OneGoods Studio · 玩物工坊

## 这个项目是什么

OneGoods Studio · 玩物工坊 是一个 **e-commerce + content** 品牌官网。

它是从「客林玩好物」（小红书数码博主账号）延伸的产品母品牌——做 maker 风格的桌面好物（MagBlock 磁吸模块化系统等），定位「值得玩、可拆、可换、可组合」。

## 技术栈

- **框架**：Next.js 16.2.4（App Router + Turbopack）
- **UI**：React 19 + Tailwind v4
- **语言**：TypeScript
- **内容**：MDX + gray-matter（产品和博客都是 MDX 文件）
- **支付**：Stripe Checkout（澳洲账号 / USD base / Adaptive Pricing）
- **邮件订阅**：Resend
- **部署**：Vercel（GitHub `main` 分支 push 自动部署）
- **生产 URL**：https://onegoods-studio.vercel.app

## 文件结构

```
.
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── page.tsx           # 首页（全屏 Hero）
│   │   ├── layout.tsx         # 根 layout（Header + Footer）
│   │   ├── globals.css        # 品牌设计 token（黑底 + 暖琥珀）
│   │   ├── brand-story/       # 品牌故事页
│   │   ├── shop/              # Shop 列表 + [slug] 详情
│   │   ├── journal/           # 工坊日记
│   │   ├── contact/           # 联系 + 邮件订阅
│   │   └── api/
│   │       ├── checkout/      # POST → Stripe Checkout Session
│   │       └── subscribe/     # POST → Resend audience.create
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── CheckoutButton.tsx # Client component
│   │   └── SubscribeForm.tsx  # Client component
│   └── lib/
│       └── content.ts         # MDX 读取器（typed loaders）
├── content/
│   ├── products/*.mdx         # SKU（含 frontmatter: priceUSD, materials, shipTo, etc.）
│   └── journal/*.mdx          # 博客
├── public/
│   └── images/                # 视觉素材（hero / 产品图 / 配图）
├── .env.local                 # secrets（gitignored）
├── .env.example               # 模板，注释列出需要的 keys
└── package.json
```

## 品牌视觉规范

设计 token 在 `src/app/globals.css`：

| 用途 | 值 |
|---|---|
| 背景 | `#0A0A0A` 深炭灰 |
| 文字主 | `#ECEAE5` 暖白 |
| muted | `#8B857A` 米色灰 |
| **强调** | `#F2A93B` 暖琥珀（LED 灯感）|
| 金属 | `#2E2E33` 哑光枪灰 |

**视觉调性：** 暗调工业 + 单一暖色光源 + matte black/brushed metal/陶瓷/干燥植物 + Bauhaus 几何对比 + curated minimalism。详细 Brand Visual Style Guide 在飞书 Drive [OneGoods 001] 子文件夹（token `LujddvpS6orZfexd1UDcX5RBnId`）。

## 业务规则

- **配送范围**：仅 AU + CN + HK + MO + TW（在 `src/app/api/checkout/route.ts` 的 `ALLOWED_COUNTRIES` 中硬编码）
- **Base currency**：USD（Stripe Adaptive Pricing 按 IP 自动转换）
- **当前 Stripe 模式**：TEST（`sk_test_*` keys，4242 测试卡）
- **Resend API key 权限要求**：Full Access（Send-only 不能管理 audience）

## 红线

- ❌ 永远不要在代码里硬编码 secret keys（用 `process.env`）
- ❌ 永远不要把 `.env.local` 提交进 git
- ❌ 不要修改 globals.css 的设计 token 颜色（品牌规范，要改先飞书 PRD 讨论）
- ❌ 不要在 Shop / 详情页用硬编码 SKU（必须从 `content/products/*.mdx` 读）
- ❌ 不要新建独立的 CRM / 后台 UI（Stripe Dashboard + Resend Dashboard 已够用）

## 工作流

1. **加新产品**：`content/products/` 新建 `xxx.mdx`，按现有 frontmatter 模板填
2. **写博客**：`content/journal/xxx.mdx`，`status: published` 才显示
3. **改文案**：直接编辑 MDX，commit + push 自动部署
4. **加视觉**：放 `public/images/`，从 MDX frontmatter 引用

## 当前状态（2026-05-04）

- ✅ Phase 1：6 页骨架
- ✅ Phase 2：MDX 内容架构 + Stripe + Resend 全套
- ✅ Vercel 生产部署 + 4 个 env vars 同步
- 待办：
  - 🟢 上传 hero-1.png 视觉素材到 `public/images/`
  - 🟡 切 Stripe Live mode（真正收钱）
  - 🟡 注册域名 → Vercel 接入
  - 🟡 上架真实产品（替换 placeholder SKU）

## 战略文档引用

- 母账号战略文档（客林玩好物 v1.1.3）：飞书 token `OM9MdPzgIovKxwxGmrPc267jn5c`
- OneGoods PRD v0.1：飞书 token `Xa7mdh5DPoJfXBxTS3Pc8JqxnUg`
- Brand Visual Style Guide v0.1：飞书 token `LujddvpS6orZfexd1UDcX5RBnId`
- 任何选题/定位/品牌决策都要回这些文档对齐
