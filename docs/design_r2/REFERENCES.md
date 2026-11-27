# OGS v2 · 外部参考（2026-11-27 抓取）

- 抓取方式：Playwright + 本机 Chrome 无头，桌面 1440×900、手机 390×844；弹窗用 Esc + 关闭按钮 + 移除 fixed 遮罩处理后再截整页。脚本 `refs/shoot.py`（可重跑：`python3 refs/shoot.py <key>`），每站另存 `refs/<key>_info.json`（标题、H1–H3、按钮文字、正文前 6000 字）。
- 截图命名：`refs/<key>_{d|m}_{fold|full}.png`（d=桌面，m=手机；fold=第一屏，full=整页，最长截到 8000px）。
- 没截成的：shoptagz.com（SSL 握手失败，11-20 的 PLAN 里已经记过它的做法，这次不重复）；popmart.com（整页懒加载，无头浏览器只出首图，已删掉截图不当证据）。
- Craighill 两张有瑕疵：首页截图右侧被购物车抽屉盖住、商品卡图片没载出来；商品页右上角被无障碍工具面板盖住。版式结构仍看得清，下面只引用看得清的部分。

## 总表

| # | 网站 | 类型 | 截图 | 跟我们最相关的一点 |
|---|---|---|---|---|
| 1 | [Swag Layers](https://swaglayers.com/products/custom-3d-printed-multi-color-name-keychain) | 印度 3D 列印名字小物店 | `swaglayers_*` | 商品线几乎就是我们：名字钥匙圈、名字按压键（Name Fidget Clicker）、关节猫钥匙圈；首屏就能打名字 |
| 2 | [Mandarin 3D · Custom name keychain](https://mandarin3d.com/catalog/name-keychain) | 美国 3D 列印客制 | `mandarin3d_*` | 客制器旁边**价格和工期一直显示**，下面是「用途 / 尺寸与价格 / 常见问题 / 同类商品」四段 |
| 3 | [Fab3D Labs · keychain](https://fab3dlabs.com/keychain) | 美国 3D 列印客制 | `fab3d_*` | 客制器右侧最后一块是**订单摘要**（文字、颜色、字型、尺寸、总价），直接接下单表单 |
| 4 | [Areaware](https://www.areaware.com/) + [商品页](https://www.areaware.com/products/everybody-night-light-in-blue) | 设计小物 DTC | `areaware_*`、`areaware_pdp2_*` | 整块亮色色场上放**黑字**也好看，原因是色场够浅够亮；商品卡底下直接列颜色款 |
| 5 | [Craighill](https://craighill.co/) + [商品页](https://craighill.co/products/chroma-scissors) | 设计五金小物 DTC | `craighill_*`、`craighill_pdp2_*` | 页脚前一条「3–6 天到货 / 免运 / 终身保固」三栏承诺；商品页规格、保养收进展开列 |
| 6 | [BAGGU](https://baggu.com/) | 设计感 DTC（包） | `baggu_*` | 商品图**全站同一种浅灰棚底**，横向滑动的新品列，卡片只有名字＋价格＋颜色数 |
| 7 | [Onecklace](https://www.onecklace.com/) | 客制名字首饰 | `onecklace_*` | 「送给谁」入口（for her / for mom…）、买家评价区、页脚前一排四个服务承诺（手工、材质、免运、90 天退） |
| 8 | [Smiski](https://smiski.com/e/) | 日本潮玩 | `smiski_*` | 每个系列一张色卡，颜色只做系列识别；可当「颜色不要太多」的反例参考 |

## 逐站笔记

### 1. Swag Layers（最接近我们，优先看）
- **首屏**：左边标题「Your name, printed in layers.」＋两颗按钮（Shop on Amazon / Try your name）＋一行信任数字（评分、From ₹150、WhatsApp 客制）；右边是一张**可以真的打名字、选颜色的小卡片**（Try your name → 输入框 → 8 个色点 → Order this on WhatsApp），旁边两张实拍商品小卡带价格。客人在首屏就完成「看到自己的名字」这一步。
- **服务条**：首屏下方三格（Personalised by design / Dispatched in 48 hours / Secure Amazon checkout），每格一个线框图标 + 一行说明。把「多久出货、怎么付钱」放在第二屏最上方。
- **分类入口**：一排圆形实拍图（名字钥匙圈、钥匙圈、桌面、Fidgets、礼物、公仔、客制）。
- **商品卡**：实拍图 → 品名＋价格同一行 → 一句说明 → 规格胶囊（`PLA`、`approx. 5×3 cm`、`PLA + keyboard switch`）→ 购买链接。卡片上方角标（Bestseller / Personalised / 3 colours）。规格胶囊让人不用点进去就知道大小和材质。
- **商品列表上方提醒**：黄色提示框「We print names exactly as typed, so please check the spelling…」——客制商品最常见的客诉提前讲。
- **制作过程**：「Built layer by layer」用分层示意说明列印过程。
- 配色：暖白底 `≈#FAF7F2` + 深海军蓝主按钮 + 粉色手写体点缀。品牌色只在按钮和标题一个字上，大面积是白。
- 可借鉴：①首屏/客制区直接给名字输入框；②48 小时出货那条服务条；③商品卡上的规格胶囊；④「名字照你打的印，请检查拼写」提醒。

### 2. Mandarin 3D
- **客制器版式**：左边 3D 预览（网格底、角落有视角方块），右边面板由上到下：名字输入（下方小字「Up to 12 characters」）→ 高度滑杆 → **大字价格 $12.38 + 「Delivered. Ships in 3–5 days.」** → 材料 → 底色色票 → 字色色票（多色加价写在色票旁）→ 数量加减＋运费 → 「Price breakdown」展开 → 「客制商品不退」勾选 → 「Order for $12.38」「Add to order」两颗按钮。
- **下面四段**：What it's for（用途）/ Sizes and price（尺寸与价格表，含「单色」「四个一起」的价格）/ Questions（钥匙圈有附吗？多耐用？能一次订不同名字吗？字能换颜色吗？）/ Also in the catalog（同类商品，「From $9.77 delivered」）。
- 配色：浅灰白底、黑字、按钮灰黑；颜色全部来自商品本身和色票。
- 可借鉴：①价格＋工期永远跟着选项显示；②「客制不退」在下单前就勾选确认（对应我们 purchase-policy 里「客製商品如涉及解除權例外，須於下單前另行告知」）；③商品页底部的 FAQ 用真实问题。

### 3. Fab3D Labs
- 深色首屏 + 预览框 + 右侧四块面板（文字 / 颜色 / 形状参数 / **Place Order 订单摘要**）。订单摘要列出所有选择，再接姓名、Email、电话、数量、备注、Place Order。下方小字说明付款方式和「24 小时内 Email 确认」「客制品不退」。
- 尺寸用两张卡片选（Standard ~55mm · $12 / Large ~80mm · $15）——**尺寸和价格写在同一个按钮上**。
- 缺点：深色底 + 亮蓝按钮很像工具站，没有品牌感；表单很长。
- 可借鉴：①订单摘要块（选了什么一目了然，送出前可检查）；②尺寸选项上直接写价格。

### 4. Areaware
- 首页：左半整块亮青柠色场（`≈#D7F27A`）放**黑色大标题**，右半实拍；接着一排商品卡（细线格子分隔，无圆角、无阴影）；再来「左实拍＋右色场标题」交错，中间一个满版商品图。
- **配色观察（回答 Ken 的「紫底黑字很怪」）**：Areaware 的色场是**高明度、高饱和**的亮色（青柠、天蓝），黑字在上面对比很高、看起来是故意的。我们的 `#A087C1` 是**中明度、低饱和**的灰紫，黑字在上面只有 4.86:1，色场又占满整个区块，看起来就发闷、发脏。结论：中灰调的薰衣草不适合当大面积文字底。
- 商品页：左图（白底 + 圆点切换）、右栏「设计师名 → 品名 → 价格 → 款式胶囊（带色点）→ ADD TO CART → 描述 → 情境图」，最下面三个展开列「PRODUCT DETAILS / CARE & USE / SHIPPING & RETURNS」，每列带一个线框图标。再下面「Meet the Designer」「You might also like」。
- 可借鉴：①款式胶囊带色点；②规格／保养／配送退换收进三个展开列，页面不长；③推荐商品放最底。

### 5. Craighill
- 首页：满版实拍首屏，下一段浅灰棚拍底商品组合；「BEST SELLERS」四栏商品卡（品名＋一句说明＋价格），卡片角标 SALE。
- **页脚前三栏承诺**：「3–6 DAY DELIVERY WITHIN USA / FREE US SHIPPING / FOR LIFE GUARANTEE」，大字、无图标、全站每页都有。
- 商品页：左大图 + 缩略图列，右侧 ADD TO CART（黑色整条、右箭头）→ 运费门槛说明 → MORE INFO / SPECIFICATIONS / CARE & MAINTENANCE 展开列 → COMPLETE THE SET（搭配购买）。
- 可借鉴：①每页都有的「到货、运费、保障」三栏；②「搭配购买」区。

### 6. BAGGU
- 商品图全部是**同一种浅灰棚底**，所以几十个颜色的商品放一起也不乱——这就是我们 §10「商品图统一底色」要达到的效果。
- 商品卡极简：图 → 品名 / 颜色名 / 「+38 MORE」颜色数 → 价格在左上。新品列可左右滑动。
- 配色：白底黑字，颜色全部来自商品；促销用一个亮黄贴纸元素。
- 可借鉴：统一棚底 + 极简卡片的秩序感；手机上横向滑动的商品列。

### 7. Onecklace（客制名字首饰）
- 首页「Gifts for him & her」三格入口、「Who is it for?」一排圆形人物入口（for her / mom / kids / couples…）、Best Sellers、按品类入口、**Loved by customers**（星等 + 标题 + 评价 + 姓名地区）、New Arrivals、「Create something personal → Start Designing」黑色横幅 + 付款方式图标、页脚前四个承诺（Handcrafted with care / Personalized / Quality materials / Trusted worldwide）。
- 配色：黑、白、香槟金，颜色很少；促销区用深底白字，图片偏暖。
- 可借鉴：①客制商品用「送给谁」做入口（我们可以做「送禮」情境，但需要 Ken 有对应的礼物包装或卡片才成立，本轮不放）；②真实买家评价区（我们**要等 Ken 有授权的买家实拍/评价**才能做，不能编）；③「开始设计」大按钮旁边放付款方式图标。

### 8. Smiski
- 全站黄＋绿，每个系列一张不同底色的色卡。品牌辨识度很强，但颜色多到商品本身被背景吃掉。
- 作为反例：**品牌色要撑辨识度，但商品区的底色要退后**。我们的商品图底统一用很浅的薰衣草，品牌紫只用在少数位置。

## 提炼：最值得借鉴的 3 点（给 Ken 的摘要用）
1. **在首页就让人打自己的名字**（Swag Layers）：首页客制区放一个名字输入框，三个款式按钮把名字带进客制器，不用先选款再打字。
2. **价格、工期、运费永远看得到**（Mandarin 3D、Swag Layers、Craighill）：首屏下一条服务条（官網刷卡／7-11 取貨 NT$60／客製 3 天內出貨）；客制器面板固定一条「價格 · 3 天內出貨」；商品页价格旁直接写运费。
3. **商品卡和商品页把规格说在前面、把细节收进展开列**（Swag Layers 规格胶囊、Areaware 三个展开列、Mandarin FAQ）：卡片上就有尺寸/材质胶囊；商品页「介紹／規格／配送與退換」三个展开列，最下面放真实常见问题。

配色上的结论：参考站没有一家把**中灰调的品牌色**当成大面积文字底。品牌色要么是很亮的色场（Areaware），要么只出现在按钮、选中、角标这些小地方（Swag Layers、BAGGU）。见 `COLOR.md`。
