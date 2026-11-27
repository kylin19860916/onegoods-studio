> ⚠️ 已被 docs/design_r2 取代（2026-11-27）：请改读 `docs/design_r2/OG_design_r2_to_codex.md`。

# OG-design-r1：OneGoods Studio 品牌化重新设计（给 MacBook 上的 Codex）

> 由 Alpha 2026-11-27 整理，同日按 Ken 的决定改版（旧版备份 `OG_design_r1_to_codex.md.bak-20261127`）。依据：同目录 `DESIGN_AUDIT.md`（逐页量测，截图在 `audit/`）、`brand_directions/`（两个品牌方向稿）、`PHOTO_BRIEF.md`（Ken 的拍摄规范与全站氛围图清单）、`../PLAN_draft.md`、`../OG1_to_codex.md`（上一轮）。
> Ken 的判断：现在的网站「杂乱、没有品牌感」，入口布局和整体设计不够完善。所以这一轮**不只是收紧规范，而是保留薰衣草主色的品牌化重新设计**：设计 token、首屏、商品卡、商品页、客制页、导航页脚、手机版、商品图统一处理。结账逻辑、价格（现货）、付款与物流设定都不动。

---

## ✅ Ken 已定（2026-11-27）

| # | 事项 | Ken 的决定 | 对本指令的影响 |
|---|---|---|---|
| **K1** | 整体风格 | 品牌化重新设计。**薰衣草紫 `#A087C1` 是既定品牌色，不变**；其他搭配配色要重新完善。 | Alpha 做了两个方向稿（`brand_directions/`）：**A 薰衣草棚**、**B 白棚標籤**。**Ken 15:06 选定 A 薰衣草棚**：全站按附录 T-A 的设计 token 实施，T-B 不用。参考稿 `brand_directions/A_d_full.png`、`A_m_full.png`。 |
| **K2** | 商品页购买区主按钮 | 绿界线上付款**已经通过**；Codex 正在把遗留版本同步到线上，Ken 之后会通知 Alpha 再测。 | **「官網下單」恢复为主按钮**；「前往賣貨便賣場」「蝦皮購買」改为次要按钮，放在主按钮下方。**页面上不准再出现「開通中」「線上刷卡開通中」**。本轮仍然**不改结账逻辑本身**（链接、`href`、点击行为都不动）。 |
| **K3** | 商品图统一底色 | Ken 自己拍白底商品图，再由 Codex 统一渲染成同一种背景底色，要有一致的棚拍感。 | 新增 **§10 商品图统一处理**（去背 → 统一底色 → 统一阴影）。拍摄规范给 Ken：`PHOTO_BRIEF.md` 第一部分。Ken 的新照片到之前，先用现有实拍按 §10 处理。 |
| **K4** | 氛围图 | 整站用真实实拍营造氛围；没有实拍时放相关素材图，**必须标示「示意」，不得有他人 IP**。 | 全站氛围图位置与替代方案见 `PHOTO_BRIEF.md` 第二部分；Codex 按 §11 接图位。⛔ `studio-workbench-DSC06956.jpg` 仍然禁用（画面有宝可梦插画、蜘蛛人公仔、PS5 手把）。 |
| **K5** | 按压款默认键帽 | 默认显示示意字，用户一输入就替换。 | 默认 **「ABC」**（Ken 说过 123 也可以；本轮用 ABC）。只改默认值，不改生成逻辑。 |
| **K6** | 客制三款价格与工期 | 工期统一「**3 天內出貨**」。价格去 Ken 的蝦皮／7-11 賣貨便店铺查对应商品。 | 见 §5.1「价格与工期」。查得到就填；**查不到就保持隐藏并在回报里列出，不准编数字。** |
| **K7** | 客服信箱和电话 | 保留展示，但弱化。 | 只放页脚（以及购买说明页等次要位置），字号 13px、`--ink-2` 色；**商品页购买区不再放「客服聯絡」那一行**。信箱、电话的文字本身不改。见 §6。 |

---

## 0. 开工前规则（必须遵守）

1. **基准分支改了（11-27）：** `dev/ogs-local-20261120b` 停在 11-20，没有包含 11-23～11-24 已上线的绿界刷卡、地址选择、7-11、按压款名字等改动。**从「目前正式站实际部署的那个 commit」开分支**（就是 Ken 刚让你同步上线的版本；先把它推到 GitHub，在回报里写明是哪个 commit）。设计稿与本指令在分支 `origin/docs/ogs-design-r1-1127` 的 `docs/design_r1/`。
   ```
   git fetch origin
   git switch -c codex/ogs-design-r1-1127 <正式站当前 commit>
   git checkout origin/docs/ogs-design-r1-1127 -- docs/design_r1
   npm ci && npm run setup:local && npm run dev      # http://localhost:5173
   ```
   其余规则照 `docs/CODEX_ALPHA_WORKFLOW.md`。**不得覆盖或回退已上线的付款、地址、物流、按压款相关改动**；本轮只动视觉与版式。
   改 `src/` 之后执行 `.venv/bin/python build.py`，生成繁中／简中／英文三语前台。**手写进 `public/` 的文字要自己检查。**
2. **不碰：** `main`、`og-upgrade-r1`、`live-source-20261120`。不部署正式站（不跑 Sites 正式发布，不 `wrangler deploy` 到 production）。不改 `.openai/hosting.json`，不改 Sites 认证相关代码。
3. **页脚「聯絡我們／客服信箱／客服電話」区块：文字、信箱、电话、链接、顺序一律不变，每一页的页脚都要有**（与绿界后台一致）。按 K7 允许的改动只有：字号改 13px、颜色改 `--ink-2`、跟新栅格对齐；以及**删除商品页购买区的「客服聯絡」那一行**（页脚仍有完整信息）。验收时用 diff 证明页脚这些文字没变（见 §8）。
4. **不改现货价格，不改结账／付款流程，不碰付款与物流设定：** `checkout*.html`、`checkout-preview*.js`、`internal-checkout.html`、`order-receipt*`、`clicker-order-test.js`、`clicker-test-pricing.js` 不动；所有购买链接的 `href` 不动；客制器的「提交確認」只改样式，不改行为。
5. **不重做 OG1 已经交代的事**：3D 打光／材质、字型子集与缓存、可印性检查、Roblox 字样、简体字和英文页中文清理、图片说明文件名、旋转派文案、图片压缩。如果 OG1 的改动还没合进 `dev/ogs-local-20261120b`，这些地方就保持原样，不要顺手改。
6. 繁中页不得出现简体字；**三语（繁中／简中／英文）都要套用本轮的版式**。英文页的眉标规则相同。
7. git 作者 `kylin1986@gmail.com`；不 force push；**每完成一组（§1–§7）就 commit 并 push 一次**：
   `git -c user.email=kylin1986@gmail.com commit -m "design-r1: <组名>"` → `git push -u origin codex/ogs-design-r1-1127`
8. 不加新的依赖套件；图标一律 inline SVG（`stroke="currentColor"`，统一 1.75px 线宽，24×24 viewBox），不用 emoji，不用字符（× + − → ✦）当图标。
9. 拿不准、做不到的地方直接列出来，不要硬做；品牌方向已定 A（附录 T-A）；客制价格查不到不要估。
10. 方向稿只是设计参考：`brand_directions/*.html` 里的商品图是 Alpha 用 Ken 实拍临时去背合成的示意图，**不要直接拿进正式站**；正式图按 §10 重新处理。

---

## 1. 设计系统 token（最先做，其余各组都建立在这里）

在 `src/style.css` 最上面的 `:root` 定义下面这些变量，然后**把现有写死的值换成变量**。旧的 `--line:2px solid var(--ink)`（第 2 行）和 `--line:1px solid #29233138`（第 16 行）重复定义了，合并成一个。

### 1.1 栅格与容器
```css
--container: 1200px;
--gutter: clamp(20px, 4vw, 40px);   /* 390 屏 = 20px；1440 屏 = 40px */
```
- 页头、每个区块的内容、页脚**共用同一个容器**：`max-width: calc(var(--container) + 2*var(--gutter)); padding-inline: var(--gutter); margin-inline: auto;`
- 删除 `--storefront-width:1000px`、`--custom-gutter`，以及 `.hero-copy{padding:60px 10%}`、`.section{padding:82px 5%}` 这类用百分比的左右内距。
- **验收：** 在 1440 下，logo、每个 H1/H2、商品卡第一张、页脚品牌名的左缘 x 值完全相同（±1px），应为 x=120；在 390 下都是 x=20。（现在是 220／256／270 三条。）

### 1.2 字阶（只准用这 8 级；具体字号与字体见附录 T-A）
| token | 用途 |
|---|---|
| `--fs-display` | 只用于首页 H1 |
| `--fs-h1` | 其他页 H1（好物、客制、客制器、关于、商品名） |
| `--fs-h2` | 区块标题 |
| `--fs-h3` | 卡片标题、小节标题 |
| `--fs-lead` | 首屏副标题、页首说明 |
| `--fs-body` | 正文、表单，16px |
| `--fs-small` | 说明、标签、导航，14–15px |
| `--fs-meta` | 图说、版权、提示、**页脚联络资料**，13px。**全站最小字号** |
- 字体：两个方向都用站上已经在载入的 **Chiron GoRound TC**（`assets/fonts/chiron-web/css/vf.css`，OFL 授权，圆体，跟 OGS 圆头字标同一个气质）。A 用于所有标题与价格；B 只用于首页 H1。内文一律 `"PingFang TC","Noto Sans TC",sans-serif`。简中页、英文页同样套用（Chiron 有拉丁字；简中字形若缺字会回退到苹方，验收时截图确认没有缺字方块）。
- 删除旧的 `OGS Site Heading`（指向 `NotoSansTC-Bold.woff`）作为标题字体的用法；那个字体文件客制器还在用的话保留文件。
- 价格数字 `font-variant-numeric: tabular-nums`。中文标题字距 -0.01em 到 -0.02em（现在 h1 是 -.065em，太挤）。
- **验收：** 每页可见文字的 font-size 只出现在所选方向字阶表里的值；**小于 13px 的文字 = 0**（现在按压款有 31 处）。用 `audit/measure.py` 的 `fontSizes` 与 `tinyCount` 字段验证。

### 1.3 间距（4 的倍数）
`--sp-1:4px --sp-2:8px --sp-3:12px --sp-4:16px --sp-5:24px --sp-6:32px --sp-7:48px --sp-8:64px --sp-9:96px`
- 区块上下内距：桌面 `--sp-9`（96px，B 用 88px），手机 `--sp-8`（64px，B 用 56px）。首页首屏上内距 ≤ 64px。
- 标题和下方内容的间距：H2 → 内容 `--sp-6`（32px）；H1 → 副标题 `--sp-4`～`--sp-5`；副标题 → 按钮 `--sp-6`。

### 1.4 颜色（语义变量；值用附录 T-A）
```css
--brand:        /* 品牌主色，两个方向都是 #A087C1 */
--brand-ink:    /* 紫色文字、链接、价格（A）、焦点框 */
--ground:       /* 页面底（取代 --paper #fffcf5 奶油色，两个方向都不再用奶油底） */
--photo-1; --photo-2;   /* 商品图统一棚拍底的上缘、下缘（§10 渲染用，也用作图片容器底色） */
--tint:         /* 浅色区块底 */
--ink; --ink-2; /* 主文字、唯一的次级文字色 */
--cta-bg; --cta-ink;    /* 成交主按钮（A：奶油黄＋梅墨；B：薰衣草＋石墨） */
--line; --line-strong;
```
- 删除这些颜色：`#fffcf5`（奶油底）、`#635b69 #55495e #51465d #6a6073 #503868`（次级灰统一成 `--ink-2`）、`#f8e7c8`（客制页米黄带）、`#f5f1f8`、`#eee8f4`、`#eadff4`、`#f7f3fa`。
- 区块底色规则按方向：A 只准用 `--ground`、`--tint`、`--brand`（整块色场，全站最多每页 1 块）和首屏棚拍渐层；B 只准用 `--ground`，区块之间用 1px `--line` 分隔。
- 薄荷 `--mint`、蜜桃 `--peach` 只能出现在客制配色色票里。
- **验收：** `sectionBgs` 只出现所选方向允许的值；`textColors` 只出现 ink、ink-2、brand-ink 三种（A 在 `--brand` 色场上的文字用 ink）。所有文字对比度 ≥ 4.5:1（附录里每组都已算过）。

### 1.5 圆角、边框、阴影（值按方向）
- A：按钮与筛选标签 pill（999px）；卡片 24px；图片 16–24px；输入框、下拉、色票方块 14px。
- B：全站唯一 10px（按钮、卡片、图片、输入框）；只有圆形色票例外。
- 删除 4/5/6/7/8/9/30px 等零散值。边框统一 `1px solid var(--line)`；hover 换 `--line-strong`。
- 阴影只留一种：`--shadow-1: 0 1px 2px rgba(41,35,49,.06), 0 8px 24px rgba(41,35,49,.06)`，只用于悬浮层（对话框、手机底部购买条）。卡片平时不加阴影、不加边框，图块本身就是棚拍底。
- **验收：** `radii` 字段只出现所选方向列出的值。

### 1.6 按钮（3 种，全站共用）
| class | 高度 | 内距 | 字 | 外观 | 用在哪 |
|---|---|---|---|---|---|
| `.btn-primary` | 48–52px | 0 24px | 16px/700 | `--cta-bg` 底、`--cta-ink` 字、无边框 | **只给能成交或推进购买的动作**，一个视口最多 1 个（商品页的「官網下單」、首页「找一件合拍的小物」、客制器「提交確認」） |
| `.btn-secondary` | 同上 | 0 24px | 16px/700 | 透明底、`1.5px solid var(--ink)`（B 用 1px） | 次要动作（开始客制、平台购买、款式卡按钮） |
| `.btn-text` | ≥44px 点击区 | 0 | 16px/600 | `--brand-ink` 字 + SVG 箭头，hover 加底线 | 返回、查看全部、说明链接 |
- 手机同样 ≥48px 高、15–16px 字（现在是 45px／12px）。按钮文字不准换行。
- `:active` 时 `transform: translateY(1px)`；`:focus-visible` 时 `outline: 2px solid var(--brand-ink); outline-offset: 3px`。
- 删除 `.text-button`、`.add`、商品卡的「查看詳情」小按钮样式。
- **验收：** 每页 `.btn-primary` 数量 ≤ 能成交的动作数。

### 1.7 眉标规则（随方向稿改）
- 方向稿里**全站不放眉标**，首页「SMALL THINGS, GOOD FEELINGS.」拿掉（Ken 11-27 确认不留；标题本身够有力，impeccable 规范把眉标列为禁用）。中文页的英文眉标和「01 / …」「03 / …」编号**全部删除**（清单见 DESIGN_AUDIT S8）。英文页同样处理。
- 如果 Ken 选方向时说要留首页那一个，就只留那一个，改成 `13px/600, letter-spacing .08em`。
- **验收：** 每页 `eyebrowCount` = 0（或按 Ken 的回复首页 1 个）。

### 1.8 图标
- 换成 inline SVG：对话框关闭「×」（index/products/product/about/nameplate 等 7 处）、FAQ 展开（CSS `content:"+"/"−"` → SVG 加号，展开时旋转 45°）、按压款加减按键、返回链接的箭头、语言切换的下拉箭头。
- 统一 24×24 viewBox、`stroke-width:1.75`、`stroke="currentColor"`、`aria-hidden="true"`；按钮本身要有 `aria-label`。

---

## 2. 首屏（首页 `src/index.html`；Ken 已定：首屏用「现货 + 客制同框」效果图）

**版式：** 左右两栏 `grid-template-columns: 5fr 7fr`，左栏文字垂直置中，右栏图片。桌面首屏总高 ≤ 视口（900）−页头，所有内容都在第一屏内。照方向稿：
- **A：** 整个首屏底色就是棚拍渐层（`--photo-1`→`--photo-2`），页头透明叠在上面；右栏图片贴到视口右缘、高度撑满首屏，图片左缘用 `mask-image` 渐隐 18% 接进底色，看起来文字和商品站在同一个棚里。
- **B：** 首屏是 `--ground` 底，右栏图片在容器内，4:3、圆角 10px，图片本身是浅灰棚拍底。
- 左栏只放 3 个元素：H1「給日常，一點好玩。」（`--fs-display`，保持两行）→ 副标题（`--fs-lead`，文案不变）→ 两个按钮。
- 按钮：「找一件合拍的小物」`.btn-primary`，「開始客製」`.btn-secondary`，间距 12px。**文案不改。**
- **删除**按钮下方 11px 的小字「原創 3D 列印設計 ／ 按壓 · 把玩 · 隨身掛飾」（三语都删）。
- 右栏图片：PLAN E1「现货 + 客制同框」图，1600×1200，底色＝所选方向的棚拍底（§10），`fetchpriority="high"`，提供 WebP，宽度 800／1600 两档 `srcset`。生成要求见 §9。**E1 到之前，先用 Ken 的 Keynade 实拍按 §10 处理成同一底色顶上，不要留空。** 用合成或生成图时，图片右下角放 13px `--ink-2`「示意」字样（方向稿就是这样标的）。
- 副标题在手机上拆成两行：「原創 3D 列印紓壓小物」／「可客製名字｜臺灣出貨」（手机隐藏第一个「｜」），避免最后一行只剩一个「貨」。桌面维持一行。
- 手机：单栏，顺序是 H1 → 副标题 → 按钮（两个各占一半，并排）→ 图片（A 全宽出血、高 300px；B 容器内 4:3）。
- **验收：** 1440：H1 两行；两个按钮的底边 y ≤ 620；首屏文字元素 = 3 个（若 Ken 要留眉标则 4 个）。390：两个按钮的底边 y ≤ 520，图片从第一屏内开始。

---

## 3. 商品卡与列表（首页「先遇見」区、`src/products.html`、`app.js` 的 `renderProducts`）

### 3.1 商品卡
- 整张卡是一个 `<a href="product.html?id=…">`（沿用现有 `detail(id)` 的目标网址，不改路由）；删除「查看詳情」小按钮和「+」按钮。
- 结构：图片区（`aspect-ratio:1/1`，按 §10 处理过的统一底色图，`object-fit:cover`）→ 品名 → 一行短描述（`--fs-small --ink-2`，`-webkit-line-clamp:1`）→ 价格。卡片 `display:flex;flex-direction:column`，价格 `margin-top:auto` 贴齐，同一行价格 y 相同。
  - A：品名 Chiron 20px/750，价格 Chiron 19px/800 `--brand-ink`，放在描述下方。
  - B：品名 16px/600 与价格 16px/600 同一行左右对齐，描述在下方；手机上品名、价格上下排，描述隐藏。
- 卡片：**无边框、无阴影、无底色**，图块圆角 `--r-card`（A 24px／手机 18px；B 10px）；hover 时图片 `scale(1.03)`（`transition: .3s cubic-bezier(.16,1,.3,1)`），在 `prefers-reduced-motion` 下不缩放。
- 栅格：桌面 4 栏、`gap:24px`（1200 宽时每张卡约 282px）；768–1023px 3 栏；手机 2 栏、`gap:12px`。
- **验收：** 价格字号符合所选方向；同一行的卡价格 y 值相同（桌面、手机都量）；整张卡的点击区 ≥ 44px 高；每张卡的图片区底色相同（§10）。

### 3.2 首页「先遇見，一點小快樂。」区块
- 删除眉标 `01 / LITTLE GOODS`；右侧浮动的说明**删除**，H2 下方不放说明句（Ken 11-27：这段文案不需要）。旋转派文案按 OG1 处理，本轮不改字。（方向稿里的「每一件都是我們畫圖、列印、組裝出來的實體小物。」也不要用。）
- 「探索全部好物」：改成 `.btn-text` + 右箭头 SVG，放在区块标题行右侧、跟说明文字底部对齐（手机放在说明下方）；不再是卡片下方的大按钮。

### 3.3 好物页 `/products`
- 页首区：H1 改成 `--fs-h1`（48／32px），删除右侧 `goods-geometry.webp` 和两个眉标；页首区与商品区合并成一个区块，H1 → 说明 → 筛选 → 商品，删除第二个 H2「實體小物，選一種玩法。」（**文案删除前在回报里列出来，让 Ken 确认**；如果 Ken 要留，就改成 H1 下方的说明文字）。
- 筛选标签：pill，44px 高，`--fs-small`；选中是 ink 底 `--ground` 字；没选中是透明底加 `--line-strong` 框。
- **验收：** 第一张商品卡顶部 y：桌面 ≤ 420，手机 ≤ 480（现在 749／734）；手机 H1 没有只剩 1–2 个字的末行。

---

## 4. 商品页（`src/product.html` + `app.js`）

### 4.1 桌面版式
- 两栏 `6fr 5fr`，间距 64px。左栏是图片区：主图 1:1、圆角 16px，缩略图 72×72、间距 8px、选中是 `2px solid var(--brand-ink)`。图片区底色＝§10 统一底色。**左栏设 `position:sticky; top: calc(页头高 + 24px)`**，解决现在左下约 550px 的空白。
- 右栏顺序：品名 H1（`--fs-h1`；删除英文眉标 `12-KEY MECHANICAL FIDGET`）→ 副标题（`--fs-lead`）→ 介绍 → 三个数字指标（数字 28px/800 `--brand-ink`，说明改成 `--fs-meta` 13px）→ 价格 32px → **购买区** → 配送说明。**删除购买区下方「客服聯絡 信箱 · 电话」那一行**（K7：联络资料只在页脚弱化展示；三语都删，`app.js` 第 45 行那段 `product-contact`）。
- 「返回實體商品」：改成页面最上方的 `.btn-text` 加左箭头 SVG，`--fs-small`。
- 「THE LITTLE DETAILS」等英文眉标删除；规格表保留现有行线，标签栏 `--fs-small --ink-2`、值 `--fs-body`。

### 4.2 购买区（K2 已定：官網下單为主；只动样式和顺序，`href` 与点击行为不变）
- 「官網下單」：`.btn-primary`，撑满右栏宽、高 52px，放在价格正下方 24px。
- 下方一行 `--fs-small --ink-2`「也可以在這些平台購買」，再下面两个平台按钮：`.btn-secondary` 横条（高 52px、左边平台 logo 24px、文字「前往賣貨便賣場」／「蝦皮購買」16px/600），桌面并排两栏、手机上下排列，间距 12px。平台按钮下的说明小字（「需登入 uniopen 會員」等）13px。
- **全站搜索并删除「開通中」「線上刷卡開通中」等字样**（商品页、结账入口附近的提示文字；`checkout*.html` 本身不动，如果那里面也有这类字，列在回报里给 Ken，不要改）。
- 结账流程本身不改：官网按钮点下去去哪里、做什么，跟现在一模一样。Ken 会在 Codex 把遗留版本同步上线后通知 Alpha 再测付款。

### 4.3 手机版
- 顺序改成：返回 → H1 + 价格（同一区，价格在 H1 下方 8px）→ 图片（1:1，宽 100%）+ 缩略图（横向滑动）→ 购买区 → 介绍、指标、规格。
- **加底部固定购买条**（只在手机，≤767px）：页面载入时显示，滑到购买区进入视口时隐藏（用 IntersectionObserver，**不准用 scroll 事件**）。内容：左边价格 18px/800，右边「官網下單」`.btn-primary`（链接与行为同购买区那颗），高 64px + `env(safe-area-inset-bottom)`，`--ground` 底、上边线 `--line`、`--shadow-1`。
- **验收（390×844）：** 价格 y ≤ 300（现在 1155）；载入后第一屏就看得到可点的购买按钮（固定购买条或购买区）；固定购买条不盖住页脚的联络资料（页脚最后加 `padding-bottom` 等于购买条高度）。

---

## 5. 客制页（`src/custom.html` 总页 + `src/nameplate.html` 三款客制器）

### 5.1 客制总页：三款并排（Ken 已定）
- 删除分页切换（`.custom-style-tabs` 和 `assets/custom-style-tabs.js` 的分页逻辑）；三款改成三张并排的款式卡：桌面 3 栏、`gap:24px`；768–1023px 3 栏；手机单栏堆叠。
- 款式卡：图片（4:3；先用现有 `custom-name-tag-studio.webp`、`custom-name-clicker-studio.webp`、`custom-name-articulated-studio.webp` 按 §10 去背换成统一底色，PLAN E5 到了再换）→ 款名 `--fs-h3` → 一句说明（沿用现有文案）→ **工期与价格行** → 按钮「客製名牌款／客製按壓款／客製關節字塊」`.btn-secondary` 撑满卡宽。整张卡可点，链接沿用现在的 `nameplate.html?style=name-tag|name-clicker|name-articulated`。
  - A：白卡（`--ground`）浮在整块 `--brand` 色场上，卡圆角 24px、内距 12px；工期与价格用胶囊标签（`--tint` 底、`--brand-ink` 字、14px），工期标签带货车 SVG 图标。
  - B：无卡片，图片下直接排字；工期与价格做成上下细线夹住的两格（「出貨／3 天內」「價格／NT$xxx 起」）。
- **工期与价格（K6）：** 工期三款都写「3 天內出貨」（简中「3 天内出货」，英文「Ships within 3 days」）。价格：到 Ken 的蝦皮店（`shopee.tw` 卖家 ID `819398831`）和 7-11 賣貨便賣場（`myship.7-11.com.tw/general/detail/GM2610308808682`）找对应的客制名牌／按压／关节字块商品，用该商品的标价（有规格价差就写最低价＋「起」）。**每款的来源网址和截图附在回报里。** 找不到对应商品的那一款：价格那一格整格隐藏（`data-price-from` 留空），在回报里写「未找到」。不准估价、不准从别处抄数字。
- 方向稿里的「價格待補」虚线标签只是稿件占位，**正式站不要出现这四个字**。
- 首屏：图片改成贴到视口右缘（或者整个首屏收进容器内，二选一，**不能再出现右侧 220px 的紫色空条**）；H1 用 `--fs-h1`；「選一個款式」按钮链接到 `#custom-styles`，改 `.btn-secondary`（这页没有成交动作，不用主按钮）。
- 删除 `studio-geometry.webp` 装饰。
- 「從名字開始」三步骤：去掉米黄底，改成 `--ground` 底的全宽区块；三步横排，步骤编号用 28px/800 `--brand-ink` 数字（不用「Step 1」），标题 `--fs-h3`，说明 `--fs-body`，每栏 `max-width:28ch`。
- **验收：** 1440 下三张款式卡顶部 y 相同，而且都在第二屏内（y ≤ 1100）；390 下三张依序排列，没有横向溢出。

### 5.2 三款客制器（只改版式，3D 和生成逻辑交给 OG1）
- 删除三个页面的英文眉标（`OGS / KEYRING STUDIO`、`OGS / PRESS & PLAY` ×2、`LIVE 3D PREVIEW`）。
- 桌面两栏 `7fr 5fr`，间距 48px，**预览框和右侧面板顶部 y 相同（±1px）**（现在差 22px）。预览框 `position:sticky`，跟商品页图片区相同。
- 面板：`--tint` 底、圆角 16px、内距 24px；分组标题 `--fs-small 700`，组间距 24px。「01 款式與尺寸／02 選顏色」分页改成没有编号的分段控制（pill，44px 高）。
- 字体选项的「中文／English」标签：13px，`--ink-2`。「重置視角」「檢視鍵軸」：44px 高的 `.btn-text` 加 SVG 图标，放在预览框右上角。
- 「提交確認」：`.btn-primary`，撑满面板宽，放在面板最下方；**行为不变**。
- 下方提示「畫面為設計示意…」：`--fs-meta`。
- 按压款加减按键：44×44，SVG 加号／减号。
- **按压款默认键帽（K5）：** 打开页面时键帽显示示意字「ABC」，预览同步显示（如果默认款式的键数不是 3 颗，这是 Alpha 的推论：按键数从 A 起顺排，例如 2 颗显示「AB」；实际怎么做在回报里说明）；用户在输入框输入第一个字时整组替换成用户的字。输入框本身维持空白（不要把「ABC」填进 value，避免被当成订单内容送出）；示意字用 placeholder 或独立的预设状态实现。Ken 说过「123」也可以，本轮用 ABC。**只改默认显示，不改生成与送出逻辑。**
- **手机（≤767px）顺序：** H1（`--fs-h1` 手机 32px）→ **姓名输入框**（名牌款／关节字块）或按键列（按压款）→ 3D 预览（高度 `min(80vw, 340px)`）→ 其余选项 → 「提交確認」。
- **验收（390×844）：** 姓名输入框（或按压款第一个按键）的底边 y ≤ 520（现在 915／1041）；预览在第一屏内开始；三款客制器小于 13px 的文字 = 0。用中文「陳怡君」、英文「Alexander」、12 个字的长名字各试一次，版面不跑掉。

---

## 6. 导航与页脚（全站）

- 页头：桌面高 72px（现在 88），logo 高 40px；导航链接 `--fs-small 600`，每个链接 `padding: 12px 12px`，让点击区 ≥ 44px 高；当前页标记按方向：A 是 ink 底胶囊（`--ground` 字），B 是 2px `--brand` 底线。语言切换：44px 高，SVG 下拉箭头（A 胶囊、B 10px 圆角）。
- 手机页头：一行 56px（logo + 语言切换），导航放第二行横排、高 44px，当前页用底线（不要浅紫方块）；页头加导航合计 ≤ 100px。不要做汉堡选单（只有 4 个链接）。
- 页脚：跟着 §1.1 的容器对齐（左缘 = 正文左缘）；底色 A 用 `--tint`、B 用 `--ground` 加上边线；三栏 `4fr 3fr 5fr`。
- **联络区块弱化（K7）：** 所有文字、信箱、电话、链接、顺序都不变；整块改成 `font-size:13px; line-height:1.7; color:var(--ink-2)`，标签「聯絡我們」只加粗到 600、不放大。信箱和电话保留可点（`mailto:`／`tel:`），可点区靠行高与上下 padding 撑到 ≥ 32px 即可（行内文字链接，不要求 44px）。不要再在页脚以外的显眼位置（首屏、商品页购买区、客制卡片）放信箱或电话。
- 页脚导航链接：点击区 ≥ 44px 高（加上下 padding）。
- **验收：** 1440 下页脚品牌名、页头 logo、正文 H1 左缘的 x 值相同；页脚联络区块文字 diff 为空（§8）；联络区块 computed `font-size` = 13px；商品页 `.product-contact` 不存在。

---

## 7. 关于页与手机版总检查

### 7.1 关于页（`src/about.html`）
- 删除 5 个眉标；H1 `--fs-h1`，副标题 `--fs-lead`（现在 12px）。
- 主视觉按 K4：Ken 的工作室／制作过程实拍（`PHOTO_BRIEF.md` 氛围图 V5）到了就用；之前先用 `public/assets/studio-materials.png`，图说写「示意」（还没确认它是实拍还是生成图，就按示意处理）。⛔ 不用 `studio-workbench-DSC06956.jpg`。
- 三个理念（原创／好玩／日常）：改成没有编号的三栏，标题 `--fs-h3`，说明 `--fs-body`。
- IG 区块：加一个 `.btn-secondary`「前往 Instagram」（链接用页脚已有的 IG 网址）；**不要放假的 IG 图片**。
- 区块底色按 §1.4 所选方向的规则。

### 7.2 手机版（所有页面 390×844 再跑一遍）
- 所有可点元素 ≥ 44×44（`smallTapCount` = 0；行内文字链接除外，例如段落里的信箱）。
- 没有横向溢出（`scrollWidth` = 390）。
- H1、H2 没有只剩 1–2 个字的末行（用 `text-wrap: balance`；CJK 不行时手动在 `<br>` 处断）。
- 多栏版式在 <768px 都要明确写出单栏规则，不靠预设。

---

## 8. 交付清单（推送后贴给 Ken，按 CODEX_ALPHA_WORKFLOW 第 5 步的格式）

1. 分支 `codex/ogs-design-r1-1127`、每组的 commit 短 hash、改了哪些文件。
2. **改前／改后截图**（用 `localhost:5173`，繁中）：首页、好物、Keynade 商品页、攪屎棍商品页、客制总页、名牌款、按压款、关节字块、关于页 × 桌面 1440 与手机 390，首屏和整页各一张。可以直接改 `design_r1/audit/measure.py` 的网址重跑（`python3 measure.py http://127.0.0.1:5173` 会输出 `local_*.png` 和 `local_measure.json`）。英文和简中各附首页与商品页。
3. `measure.py` 改后的 JSON，并对照下表：

| 指标 | 现在（正式站） | 目标 |
|---|---|---|
| 1440 下 logo／H1／页脚左缘 | 220／256–270／220 | 全部相同 |
| 小于 13px 文字（按压款） | 31 | 0 |
| H1 字号种类 | 5 种 | 2 种（首页 display、其他 h1，值按所选方向） |
| 圆角种类 | 8 种 | 所选方向列出的值 |
| 区块底色种类 | 6 种 | 所选方向允许的值 |
| 中文页眉标数 | 每页 0–5 个 | 0（Ken 要留则首页 1） |
| 页脚联络区块字号 | 14–16px | 13px |
| 页面上「開通中」字样 | 有 | 0 |
| 手机商品页价格 y | 1155 | ≤ 300 |
| 手机客制器输入框 y | 915 | 底边 ≤ 520 |
| 手机 <44px 点击区（商品页） | 12 | 0 |
| 商品卡价格字号 | 10px（手机 11） | A 19px／B 16px（手机 17／16） |

4. **Lighthouse 手机版**（改前、改后）：首页、Keynade 商品页、客制总页、名牌款客制器。本轮不以性能分数为目标，但**不准比改前低**（11-20 的基准：首页 73、商品页 65）。
5. **不动区证明：**
   - `git diff origin/dev/ogs-local-20261120b -- src/checkout* src/internal-checkout.html src/order-receipt* src/clicker-order-test.js src/clicker-test-pricing.js .openai/` 输出为空。
   - 页脚联络区块：在三语页面用浏览器取出 `footer` 联络区块的 `innerText`，改前改后逐字比对相同；另附商品页改后截图证明「客服聯絡」行已删除（K7）。
   - 所有购买链接 `href` 改前改后清单相同。
6. 繁中页 OpenCC 检查：0 个简体字（「台」在「平台」里是正常繁体，不算）。
7. 做不到、拿不准、或需要 Ken 决定的地方，逐条列出。

## 9. 效果图（Ken 已定先做三类：首屏、客制三款并排、款式卡）

> 共 5 张。**底色改成所选方向的棚拍底**（A：`#EDE6F5→#DED4EC` 薰衣草渐层；B：`#F5F4F6→#E8E7EB` 浅灰渐层），下面提示词里的 `#f3eef7`／`cream backdrop` 一律换成对应色值。商品主图一律用 Ken 的实拍；效果图只用在情境、组合、客制示意，alt 文字写「示意」，不能冒充实拍商品。**生成前把这 5 张的清单和预计用量报给 Ken。** 图里不放文字、不放 logo、不放任何 IP 角色。提示词一律用英文。

| # | 放在哪 | 尺寸 | 提示词 |
|---|---|---|---|
| E1 | 首页首屏右栏 | 1600×1200 | 以 Ken 的 Keynade 实拍（`assets/keynade/01-front-retouched-v2.jpg`）为参考，重新生成干净的新图：`soft studio product photo, a gold hexagon-paneled 3D-printed fidget keychain (reference image) beside a pastel lavender name keychain reading "Mia", matte PLA with fine layer lines, pale lavender seamless backdrop #f3eef7, soft top-left light, gentle contact shadows, 45-degree tabletop angle, generous empty space on the left, no text overlay, no logos` |
| E2 | 首页客制带状区（替换 `home-clicker-styles.webp`） | 1800×800 | `three personalized 3D-printed keychains in a row: a name-outline tag reading "Mia", a two-key clicker keychain with letter keycaps, articulated letter blocks reading "LEO"; pastel lavender, butter yellow and mint plastic; cream backdrop; even soft light; straight-on view; realistic matte plastic texture; no text other than the names` |
| E5 ×3 | 客制总页三张款式卡（替换 `custom-*-studio.webp`） | 1200×900 ×3 | 跟 E2 同一套光线和底色，每张只放一款，名字沿用现在的示意名「Mia／飛／LEO」 |

- 如果生成工具不能用，就保留现有图片，在回报里写明哪几个位置还在等图，**不要用 CSS 或 SVG 画假商品图**。

---

## 10. 商品图统一处理（K3：去背 → 统一底色 → 统一阴影）

> Ken 自己拍白底商品图（拍法见 `PHOTO_BRIEF.md` 第一部分），Codex 统一渲染成同一种背景，做出一致的棚拍感。**主体像素必须是 Ken 的实拍**，只换背景、加阴影，不用生成模型重画商品本身。

**输入：** Ken 交付的白底原图，文件名 `<商品id>_<视角编号>_<视角>.jpg`（例：`keynade-mx_01_front.jpg`），放 `assets/products/raw/`（原图不进正式站、不进 git LFS 以外的大文件，先问 Alpha 放哪；只提交处理后的 WebP）。

**步骤（写成可重跑的脚本 `scripts/product_photo_pipeline.*`，同一批图重跑结果一致）：**
1. **去背：** 用本机可重复的抠图（macOS Vision `VNGenerateForegroundInstanceMaskRequest`、rembg 或同等工具，选一种写死）。alpha < 60 的像素清成 0（去掉半透明残渣，方向稿实测有这个问题）；边缘 1px 羽化。珠链、钥匙圈这类细件要放大到 200% 检查有没有被切断，被切断就用该商品的手动遮罩修。
2. **裁切与定位：** 以主体的不透明外框为准。商品卡用 1:1 画布 1600×1600：主体最长边占画布 68%（±3%），水平置中，**主体底边落在画布高度 83%**（所有商品同一条地平线）。客制款式卡用 4:3 画布 1600×1200，主体最长边占 66%。
3. **统一底色：** 画布填所选方向的棚拍渐层（由上到下）：A `#EDE6F5 → #DED4EC`；B `#F5F4F6 → #E8E7EB`。加 0.6 级的随机抖动避免 JPEG／WebP 色带。
4. **统一阴影：** 两层、同一组参数套全部商品——① 接触阴影：主体底边下方的椭圆，宽 = 主体宽 70%，高 28px（1600 画布），颜色 A `rgb(60,40,80)`／B `rgb(40,38,48)`，不透明度 31%，高斯模糊 22px；② 不加投影方向的长阴影（光从正上方偏左前，Ken 拍的时候就是这个方向，见拍摄规范）。
5. **调色：** 只做白平衡和曝光对齐（以底色区域为灰卡），**不改商品本身的颜色**（金色闪点、粉彩色要跟实物一致）。不磨皮、不锐化过度。
6. **输出：** WebP 质量 82，`800w`／`1600w` 两档；文件名 `<商品id>_<编号>_<A|B>.webp`；每张在 EXIF／旁边的 `.json` 里记录来源原图文件名与处理参数。
7. **验收：** 4 张商品卡并排截图，底色取样（每张图四角 20×20 平均）彼此差 ≤ 2（RGB 各通道）；主体底边 y 一致（±1%）；放大 200% 看边缘没有白边或残渣。

**照片到之前：** 先用现有实拍（`assets/keynade/*-retouched-v2.jpg`、`/media/…` 里的财屎运、Enerkey、搅屎棍）跑这条流程顶上。Keynade 页面「關於這件小物」里那句「商品照片經過 AI 輔助統一色調、光線與背景。」：处理后改成「商品照片為實拍，背景經統一處理。」——**Ken 11-27 已确认这句可以用**（PLAN 1.2 原本就指出旧说法跟实际不符）。

## 11. 氛围图位（K4）

`PHOTO_BRIEF.md` 第二部分列了 V1–V8 八个氛围图位置。Codex 这一轮要做的：
- 在每个位置把图位**结构先做好**（容器、比例、`srcset`、`alt`、图说位置），没有 Ken 实拍的位置先放清单里写的替代素材。
- 替代素材的图说一律在图片右下角放 13px `--ink-2`「示意」；alt 文字结尾加「（示意）」。
- 替代素材来源只能是：Ken 现有的实拍、`public/assets/` 里已经在用的自家图、或生成图。**不准用网络图库或他人作品**；图里不能出现他人 IP（角色、品牌 logo、游戏机等）、文字或可辨识的人脸。生成图提示词英文，生成前把张数报给 Ken。
- Ken 的实拍到了以后，只换图片文件、拿掉「示意」，不动版式。

---

## 附录 T：设计 token（Ken 已选 A：用 T-A 填入 §1.4–§1.6；T-B 仅存档，不实施；正文里写「B 是…」的分支一律忽略）

> 稿件：`brand_directions/A_lavender_studio.html`、`brand_directions/B_white_label.html`；截图 `brand_directions/{A,B}_{d,m}_{fold,full}.png`；色票对照 `brand_directions/tokens_board.png`。对比度都已算过（WCAG AA）。

### T-A 薰衣草棚（Alpha 推荐）
**一句话：** 整站像同一个薰衣草摄影棚。品牌色用整块色场撑起辨识度，商品永远站在薰衣草棚拍底上。
```css
--brand:#a087c1;      /* 主色：客制区整块色场、选中底 */
--brand-ink:#5e4382;  /* 链接、价格、焦点框；对 ground 7.76:1，对 tint 7.18:1 */
--ground:#fbfafd;     /* 页面底：冷瓷白 */
--photo-1:#ede6f5; --photo-2:#ded4ec;   /* 棚拍渐层：首屏底、商品图底 */
--tint:#f4f0f9;       /* 浅区块底、页脚、胶囊标签 */
--ink:#2b2236;        /* 主文字；对 ground 14.58:1，对 brand 4.86:1 */
--ink-2:#5f566c;      /* 次级文字；对 ground 6.66:1，对 photo-2 4.86:1 */
--cta-bg:#f2c879; --cta-ink:#2b2236;    /* 成交按钮：奶油黄（9.61:1） */
--line:rgba(43,34,54,.12); --line-strong:rgba(43,34,54,.28);
--r-btn:999px; --r-card:24px; --r-img:16px; --r-input:14px;
--font-head:"Chiron GoRound TC WS","PingFang TC",sans-serif;   /* 所有标题、价格 */
--font-body:"PingFang TC","Noto Sans TC",sans-serif;
```
- **使用比例：** 页面底 50%、棚拍底与浅区块 25%、薰衣草色场 13%、文字 10%、黄 2%。
- **字阶（桌面／手机）：** display 68／42（850）；h1 48／32（800）；h2 40／28（800）；h3 20–24／16–24（750）；lead 19／17；body 16；small 14–15；meta 13。价格 19／17（Chiron 800）。
- **版式语言：** 首屏整块棚拍渐层、图片贴到右缘；商品卡无框无影，图块即棚拍底；客制区整块 `--brand` 色场、白卡浮在上面；每页最多 1 块 `--brand` 色场。
- **按钮：** 胶囊；主按钮奶油黄；次按钮 1.5px ink 描边；导航当前页 ink 底胶囊。
- **图片：** 统一薰衣草棚拍底（§10），圆角 24px（卡）／16px（客制卡内图）。
- **风险：** 薰衣草面积大，商品本身如果也是紫色（例如攪屎棍原图的紫底、薰衣草色名牌）会跟背景贴得太近，需要 §10 的接触阴影把主体托出来；Ken 拍紫色商品时要特别注意边缘。

### T-B 白棚標籤
**一句话：** 安静的选物店。页面几乎无色，薰衣草只出现在品牌与行动上（logo、主按钮、选中线），每一处紫都有意义；黄色退场。
```css
--brand:#a087c1;      /* 主色：主按钮底、选中底线 */
--brand-ink:#674a8a;  /* 链接；对 ground 6.89:1 */
--ground:#fafafb;     /* 页面底：中性冷白 */
--photo-1:#f5f4f6; --photo-2:#e8e7eb;   /* 浅灰棚拍渐层 */
--tint:#efe9f6;       /* 标签浅紫（少量） */
--ink:#1e1c22;        /* 石墨；对 ground 16.18:1 */
--ink-2:#5d5a64;      /* 对 ground 6.47:1 */
--cta-bg:#a087c1; --cta-ink:#1e1c22;    /* 成交按钮：薰衣草底黑字（5.41:1） */
--line:rgba(30,28,34,.12); --line-strong:rgba(30,28,34,.28);
--r-btn:10px; --r-card:10px; --r-img:10px; --r-input:10px;
--font-head:"PingFang TC","Noto Sans TC",sans-serif;   /* 区块标题 600；只有首页 H1 用 Chiron 800 */
--font-body:"PingFang TC","Noto Sans TC",sans-serif;
```
- **使用比例：** 页面底 68%、棚拍底 20%、文字 8%、薰衣草 4%。
- **字阶（桌面／手机）：** display 60／40（Chiron 800）；h1 44／30（600）；h2 34／26（600）；h3 22（600）；lead 18／17；body 16；small 14–15；meta 13。价格 16（600，与品名同行）。
- **版式语言：** 全部 `--ground` 底，区块之间 1px 细线；首屏图片在容器内 4:3；商品卡无框、品名与价格同一行；客制款式不用卡片，工期／价格用细线夹住的两格。
- **按钮：** 10px 圆角；主按钮薰衣草底黑字；次按钮 1px ink 描边；导航当前页 2px 薰衣草底线。
- **图片：** 统一浅灰棚拍底（§10），圆角 10px。
- **风险：** 克制到接近通用电商模板，品牌辨识度主要靠 logo 和按钮；如果 Ken 要的是「一眼认出是 OGS」，B 的力度可能不够。
