# OG r2 fix2：全站文案精简（交给 Codex）

> 分支：`codex/ogs-design-r2-1127`，**在 fix1 之后做，同一分支继续提交**。基准 commit `d978b28`。
> 来源：Ken 11-28「很多文字奇怪又繁琐，例如『提交確認』直接写『提交』、『官網下單』直接写『購買』、『加入購物車』也就是『購買』，类似的都要处理掉。」

## 规则

1. 按钮／标签用最短的动词或名词（2–4 字为主）；同一动作全站同一说法（见「全站统一用语表」，所有下单按钮统一「購買 / Buy」）。
2. 删掉多余说明、同屏重复信息、自我介绍式废话和「請」「您可以」「即時」「目前」「正在」类填充词；提示改成一句话。
3. 不改事实：价格、运费、出货天数、退换货实质、信箱电话只能缩短措辞不能改意思；法规／付款必要文字保留。
4. 第一人称、有人味但短；繁中用台湾用语（購買、客製、運費、超商取貨、拖曳）；英文页同步精简。
5. 「賣貨便」「蝦皮」照用。
6. **第 9 节（结账）全部暂不改**，等 Ken 确认后另行通知。

## 0. 文案在哪里改（三语机制，先读）

`build.py` 的实际做法：

1. **`src/*.html` 与 `src/app.js`、`checkout-address-search.js` 的源文字是「简中」**（`lang="zh-Hans"`），简中页 `/zh-cn/` 直接用源文字。
2. 繁中页与英文页靠 `src/translations.json` 做字符串替换：**key = 简中源文字，value = [繁中, 英文]**；繁中页最后再整页过一次 OpenCC `s2twp`。
3. 所以**改一处文案 = 同时改三处**：源文件里的简中文字、translations.json 的 key（同步改成新的简中）、value 的繁中和英文。只改源文件不改 key → 英文页会漏出中文。
4. 例外：`nameplate.js`、`custom-types.js`、`keyring-clicker.js` 是行内三语数组 `[繁, 简, 英]` 或按 `lang` 判断；`checkout-preview.js` 只有繁中（内部预览，不进三语替换）。
5. translations.json 有 629 条，其中不少是旧版遗留、页面已不再出现。本表只列**当前页面可见**的文字；旧条目不必清理（不在本次范围）。

## 1. 全站统一用语表

| 动作／概念 | 统一说法（繁） | 英文 | 取代掉的旧说法 |
|---|---|---|---|
| 官网下单（所有下单按钮） | **購買** | **Buy** | 官網下單、前往下單、前往 7-ELEVEN 賣貨便購買、確認設計並前往… |
| 外部平台按钮 | **賣貨便**／**蝦皮** | **MyShip**／**Shopee** | 前往賣貨便賣場、蝦皮購買、賣貨便購買 |
| 外部平台区标题 | **其他平台** | **Also on** | 其他購買平台、選擇購買平台 |
| 客制入口（所有卡片／CTA） | **客製** | **Customize** | 開始客製、客製名牌款、客製按壓款、客製關節字塊、探索客製款式 |
| 送出客制设计 | **提交** | **Submit** | 提交確認、送出設計，我們會與你聯絡確認、提交列印訂單 |
| 看完整列表 | **看全部** | **View all** | 看全部好物、探索全部好物、探索全部實體商品 |
| 去逛商品 | **逛好物** | **Shop** | 找一件合拍的小物、繼續逛逛、瀏覽實體商品 |
| 返回上一层 | **返回** | **Back** | 返回商品、返回客製款式、返回購物袋、返回訂單確認 |
| 付款按钮 | **付款** | **Pay** | 前往付款、前往綠界付款 |
| 名字输入框标签 | **名字** | **Name** | 先輸入名字、姓名或文字、姓名文字、你的名字、名牌文字 |
| 颜色步骤 | **配色** | **Colors** | 選顏色、選擇配色、名牌配色、鑰匙圈配色 |
| 3D 渲染图说明 | **3D 預覽圖** | **3D preview** | 商品圖為 3D 預覽渲染 |
| 重置 3D 视角 | **重置** | **Reset** | 重置視角 |
| 拖曳操作提示 | **拖曳旋轉 · 雙指縮放** | **Drag to rotate · Pinch to zoom** | 拖動旋轉 · 捏合縮放（「拖動」「捏合」不是台湾用语） |
| 重试类错误收尾 | **再試一次** | **Try again** | 請再試一次、請重試、請稍後重新整理頁面 |
| 客服 | **信箱**／**電話** | **Email**／**Phone** | 客服信箱、客服電話、聯絡電話 |

通用规则：去掉「請」「您可以」「即時」「目前」「正在」类填充；提示一句话；同一屏同一件事只说一次。

## 2. 全站共用（页头、服务条、页脚、说明弹窗）

| 位置 | 现在（繁中） | 改成（繁中） | 英文改成 | 理由 |
|---|---|---|---|---|
| service-strip.inc:2 | 官網刷卡付款 | 官網刷卡 | Pay by card | 「付款」与「刷卡」重复 |
| service-strip.inc:2 | 也可在賣貨便、蝦皮購買 | 賣貨便、蝦皮也買得到 | Also on MyShip & Shopee | 更短、口语 |
| service-strip.inc:4 | 客製 3 天內出貨 | （不变） | Custom: ships in 3 days | 事实，已够短 |
| service-strip.inc:4 | 名牌款、按壓款、關節字塊 | 名牌、按壓、關節字塊 | Name tags, clickers, letters | 去掉重复的「款」 |
| 页脚 各页 `footer` 品牌标语 | 紓壓、有趣，自成一格。 | （不变） | Relaxing. Playful. Uniquely yours. | 品牌语，保留 |
| 页脚 联络栏 | 聯絡我們 | 聯絡 | Contact | 标题求短 |
| 页脚 联络栏说明 | 商品、客製或訂單問題，歡迎與我們聯繫。 | 有問題就找我們。 | Questions? Get in touch. | 第一人称、短 |
| 页脚 联络栏 | 客服信箱 / 客服電話 | 信箱 / 電話 | Email / Phone | 「客服」多余 |
| 页脚 联络栏 | 官方網站 https://onegoods.studio | 删除 | 删除 | 人已经在官网上 |
| 页脚 联络栏底部 | 購買與售後說明　隱私權說明（第二组） | 删除这一组 | 删除 | 左侧导航栏已有同样两个链接，同屏重复 |
| 页脚 导航栏 | 購買與售後說明 | 售後說明 | Returns & policy | 链接文字求短；页标题仍可保留全名 |
| 页脚 `aria-label` | 聯絡我們 | 聯絡 | Contact | 与可见标题一致 |
| 说明弹窗 index.html:45 等 标题 | 購買與授權說明 | 購買說明 | Buying info | 授权只跟数位档有关 |
| 说明弹窗 index.html:45（首页版） | 官網下單可用信用卡付款（綠界），也可以透過 7-11 賣貨便或蝦皮購買。 | ⚠️ 见结账待确认清单 C1 | — | 涉及付款说明 |
| 说明弹窗 products/product/about.html（其他页版） | 從商品頁選擇賣貨便或蝦皮，即可前往購買。 | 官網刷卡，或到賣貨便、蝦皮購買。 | Pay by card here, or buy on MyShip or Shopee. | 旧文案漏了官网刷卡，且四页说法不一致，统一成首页「怎麼買」那句 |
| 说明弹窗 实体商品段 | 訂單、付款與配送由所選平台處理。購買前，請確認商品內容與平台上的配送資訊。 | 平台訂單的付款與配送由該平台處理。 | Platform orders are paid and shipped by that platform. | 两句并一句，去「請確認」 |
| 说明弹窗 数位档案段 | 數位檔案不包含實體商品。購買前需核對檔案格式、所需配件、列印要求及授權範圍。 | 數位檔案不含實體商品，購買前看清格式、配件、列印需求和授權。 | Digital files don't include a physical item. Check format, parts, printing needs and license first. | 缩短 |
| 说明弹窗 关闭按钮 `aria-label` | 關閉說明 / 關閉商品詳情 | 關閉 | Close | 读屏也求短 |
| 语言切换（build.py:49） | 切換語言，目前：繁體中文 | 語言：繁體中文 | Language: English | 去「目前」 |

## 3. 首页 index.html

| 位置 | 现在（繁中） | 改成（繁中） | 英文改成 | 理由 |
|---|---|---|---|---|
| :10 hero 副标 | 原創 3D 列印紓壓小物 可客製名字｜台灣出貨 | （不变） | （不变） | 已够短 |
| :11 hero 主按钮 | 找一件合拍的小物 | 逛好物 | Shop | 按钮 2–4 字 |
| :11 hero 次按钮 | 開始客製 | 客製 | Customize | 统一 |
| :20 商品区按钮 | 看全部好物 | 看全部 | View all | 统一 |
| :26 客制区副标 | 選擇名牌款、按壓款或關節字塊，換上你的名字和配色，即時看 3D 效果。 | 三款任選，換上你的名字和配色，3D 直接看。 | Pick one of three, add your name and colors, see it in 3D. | 去「即時」，缩短 |
| :27 名字输入标签 | 先輸入名字 | 名字 | Name | 标签用名词；占位符已示范 |
| :28 占位符 | 例如 Mia、小飛 | Mia、小飛 | Mia | 去「例如」 |
| :30 图说 | 商品圖為 3D 預覽渲染 | 3D 預覽圖 | 3D preview | 统一 |
| app.js:83 客制卡片按钮（custom-types.js `action`） | 客製名牌款 / 客製按壓款 / 客製關節字塊 | 客製 | Customize | 卡片标题已写款名，按钮不必重复 |
| :34 怎麼買 第一步标题 | 下單 | 購買 | Buy | 统一用语 |
| :34 第二步说明 | 客製商品 3 天內出貨。 | 客製 3 天內出貨。 | Custom orders ship in 3 days. | 去「商品」 |
| :34 第三步标题 | 收貨 | （不变） | Delivery | — |
| :36 FAQ 運費怎麼算？ 答 | 7-ELEVEN 超商取貨 NT$60，黑貓宅配 NT$100，在結帳時選擇。 | 7-ELEVEN 取貨 NT$60、黑貓宅配 NT$100，結帳時選。 | 7-ELEVEN pickup NT$60, Black Cat delivery NT$100. Choose at checkout. | 运费数字不变，只缩措辞 |
| :37 FAQ 客製多久出貨？ 答 | 客製商品 3 天內出貨。 | 3 天內出貨。 | Within 3 days. | 问句已说「客製」 |
| :38 FAQ 可以退換嗎？ 答 | 一般商品收到後七日內可申請退貨；客製商品如涉及例外，會在下單前告知。詳見購買與售後說明。 | 一般商品收到 7 天內可申請退貨；客製品若不適用，下單前會先說明。 | Standard items: request a return within 7 days of delivery. If a custom item is an exception, we'll tell you before you order. | 退货实质不变；删「詳見…」，下方 :39 已有同名链接 |
| :39 FAQ 下方链接 | 購買與售後說明 | 售後說明 | Returns & policy | 与页脚统一 |
| :2 `<meta description>` | 原創 3D 列印小物與數位設計。探索原創按壓小物與隨身掛飾。 | 原創 3D 列印紓壓小物，可客製名字，台灣出貨。 | Original 3D-printed fidgets. Custom names. Ships from Taiwan. | 「原創」出现两次；与 hero 一致 |

## 4. 好物列表 products.html

| 位置 | 现在（繁中） | 改成（繁中） | 英文改成 | 理由 |
|---|---|---|---|---|
| :7 h1 | 拿在手裡，才是小快樂。 | （不变） | Little joys you can hold. | 品牌语 |
| :8 副标 | 探索原創按壓玩具與隨身掛飾，找到合拍的日常小物。 | 原創按壓玩具和隨身吊飾。 | Original clickers and charms. | 去「探索」「找到合拍」 |
| :11–14 筛选 | 全部 / 按壓 / 吊飾 / 可客製 | （不变） | All / Clickers / Charms / Custom | 已统一 |
| app.js:24 旧版筛选第一项 | 全部好物 | 全部 | All | 与 r2 筛选一致 |
| :17–18 排序 | 排序 / 推薦 / 價格低到高 | （不变） | Sort / Featured / Price: low to high | — |
| app.js:97 空状态 | 目前沒有符合條件的商品。 | 這裡還沒有商品。 | Nothing here yet. | 去「目前」「符合條件」 |
| app.js:96 客制筛选图说 | 商品圖為 3D 預覽渲染 | 3D 預覽圖 | 3D preview | 统一 |
| app.js:77 客制卡片 | 開始客製 | 客製 | Customize | 统一 |
| :23 图说 | 示意合成 | （不变） | Composite | — |

## 5. 商品详情 product.html（内容由 app.js:113–160 渲染）

| 位置 | 现在（繁中） | 改成（繁中） | 英文改成 | 理由 |
|---|---|---|---|---|
| app.js:132 购买按钮 `#r2-official-order` | 官網下單 | 購買 | Buy | Ken 点名 |
| app.js:133 手机底部浮条按钮 | 官網下單 | 購買 | Buy | 同上 |
| app.js:30 `buyAction` 官网入口 | 官網下單 | 購買 | Buy | 同上 |
| app.js:31 | 尚未開售 | （不变） | Not yet on sale | — |
| app.js:34 平台区标题 | 其他購買平台 | 其他平台 | Also on | 「購買」多余 |
| app.js:34 平台区说明 | 訂單、付款與配送由各平台處理。 | 删除 | 删除 | 下方「配送與退換」已说明，同屏重复 |
| app.js:32 賣貨便按钮主文 | 前往賣貨便賣場 | 賣貨便 | MyShip | 统一 |
| app.js:32 賣貨便按钮副文 | 需登入 uniopen 會員 | 需 uniopen 帳號 | uniopen account needed | 事实保留，缩短 |
| app.js:32 蝦皮按钮主文 | 蝦皮購買 | 蝦皮 | Shopee | 统一 |
| app.js:32 蝦皮按钮副文 | 前往 Shopee 商品頁 | 删除 | 删除 | 重复主文 |
| app.js:134 Keynade 数字条 | 獨立按鍵 / 機械鍵軸結構 / 金屬珠鏈隨附 | 獨立按鍵 / 機械鍵軸 / 附珠鏈 | Independent keys / Mechanical switches / Chain included | 缩短 |
| app.js:135 商品介紹第一段 | 幾何外殼上的 12 個大面板，都是可獨立按壓的機械按鍵。頂部插銷可以拔出、插回，是造型與把玩的裝飾細節。 | 12 個大面板都是獨立的機械按鍵。頂部插銷可拔出插回，純裝飾。 | All 12 large panels are independent mechanical keys. The top pin pulls out and back in — just for fun. | 缩短，事实不变 |
| app.js:135 商品介紹第二段 | 3D 列印的層紋與金色閃點，保留在真實物件的表面。按壓聲音與手感依搭配的軸體而定。 | 表面保留 3D 列印層紋和金色閃點；聲音與手感依軸體而定。 | Print layers and gold sparkle stay visible. Sound and feel depend on the switches. | 缩短 |
| app.js:136 商品介紹备注 | 頂部插銷為裝飾零件；小面板為固定造型件，12 個大面板可按壓。實拍中的場景物件不屬於商品內容。 | 實拍中的道具不含在內。 | Props in the photos are not included. | 前半句与介绍、商品描述重复，只留新信息 |
| 商品描述（后台商品数据 `description`，非 src） | 手雷造型與機械鍵軸結合的掌心紓壓小物。12 個大面板可獨立按壓，其餘小面板為固定造型件。… | 不在本次范围，建议后台改短 | — | 数据在后台，与上面重复；告知 Ken 即可 |
| app.js:140 图说 | 商品照片為實拍，背景經統一處理。 | 實拍照，背景經統一處理。 | Real photos, background retouched. | 缩短 |
| app.js:144 运送条 | 收到商品 7 天內可申請退貨　售後說明 | 收到 7 天內可申請退貨　售後說明 | Returns within 7 days of delivery · Policy | 去「商品」，事实不变 |
| app.js:147 折叠标题 | 商品介紹 | 介紹 | About | 求短 |
| app.js:148 折叠标题 | 規格與隨附內容 | 規格 | Specs | 求短（内含物仍在里面） |
| app.js:149 配送與退換 内文 | 平台訂單的配送方式與運費，請在蝦皮或賣貨便結帳時確認。 | 在蝦皮、賣貨便下單的，運費以該平台結帳為準。 | For Shopee or MyShip orders, shipping is set at their checkout. | 去「請」，事实不变 |
| app.js:149 配送與退換 内链 | 購買與售後說明 | 售後說明 | Returns & policy | 统一 |
| app.js:151 客制推广标题 | 也想要一個有你名字的？ | （不变） | Want one with your name? | 有人味，保留 |
| app.js:152 名字标签 | 先輸入名字 | 名字 | Name | 统一 |
| app.js:153 按钮 | 開始客製 | 客製 | Customize | 统一 |
| app.js:154 图说 | 商品圖為 3D 預覽渲染 | 3D 預覽圖 | 3D preview | 统一 |
| app.js:155 相关商品按钮 | 看全部好物 | 看全部 | View all | 统一 |
| app.js:113 找不到商品 | 找不到這件商品。　瀏覽實體產品 | 找不到這件商品。　返回好物 | Product not found. · Back to shop | 「實體產品」是旧分类说法 |
| app.js:186 载入失败 | 商品資料暫時無法載入，請稍後重新整理頁面。 | 商品載入失敗，重新整理再試一次。 | Couldn't load the product. Refresh to try again. | 去「暫時」「請稍後」 |
| :2 `<title>` / description | 商品詳情 — One Goods Studio / 查看 OGS 商品內容及購買說明。 | （不变） | （不变） | 运行时会被商品名覆盖 |

## 6. 客制页 custom.html（含注入的 nameplate.html 工作台）

### 6.1 页面框架

| 位置 | 现在（繁中） | 改成（繁中） | 英文改成 | 理由 |
|---|---|---|---|---|
| :18 h1 | 哇塞，這是我的！ | （不变） | Wow, that's mine! | 有人味 |
| :18 副标（与 :8 meta 同句） | 選擇想客製的款式，加入名字和配色，即時預覽你的 3D 作品。 | 選款式、打名字、配顏色，3D 馬上看。 | Pick a style, add your name and colors, see it in 3D. | 去「即時」，缩短 |
| :18 图说 | 商品圖為 3D 預覽渲染 | 3D 預覽圖 | 3D preview | 统一 |
| :22 名字标签 | 先輸入名字 | 名字 | Name | 统一 |
| :23 占位符 | 例如 Mia、小飛 | Mia、小飛 | Mia | 去「例如」 |
| :27 对比表标题 | 三款怎麼選 | （不变） | Which one? | — |
| nameplate.js:381–387 对比表行名 | 玩法 / 可選設定 / 出貨 / 價格 | 玩法 / 可改 / 出貨 / 價格 | Play / Options / Ships / Price | 「可選設定」生硬 |
| custom-types.js:4 名牌款玩法 | 掛在日常小物上 | 掛包包、鑰匙 | Hang it on a bag or keys | 具体、短 |
| custom-types.js:6 按壓款玩法 | 點按鍵帽 | 按著玩 | Press it | 口语 |
| custom-types.js:8 关节字块玩法 | 扭動關節字塊 | 扭來扭去 | Twist it | 口语、不重复款名 |
| custom-types.js:4/6/8 可改 | 名字、輪廓與配色 / 名字、字型與配色 | （不变） | Name, outline, colors / Name, font, colors | — |
| nameplate.js:400 出货格 | 3 天內 | （不变） | 3 days | — |
| :28 「從名字開始」整段（選款式 / 輸入名字 / 選字型與配色 / 確認 3D 預覽） | 整段 | **删除** | 删除 | 副标和上方工作台已是同一流程，同页说两次 |
| :30 FAQ 客製多久出貨？ 答 | 客製商品 3 天內出貨。 | 3 天內出貨。 | Within 3 days. | 同首页 |
| :31 FAQ 可以退換嗎？ 答 | 同首页 :38 | 同首页 :38 改法 | 同首页 | 全站一致 |
| :32 FAQ 名字會照我輸入的印嗎？ | 會照你在預覽裡看到的內容製作，送出前請確認拼寫。 | 會，預覽長什麼樣就做什麼樣，送出前看一下拼寫。 | Yes — what you see in the preview is what we make. Check the spelling first. | 第一人称、去「請」 |

### 6.2 工作台通用（nameplate.html，名牌／按压／关节字块三模式共用）

| 位置 | 现在（繁中） | 改成（繁中） | 英文改成 | 理由 |
|---|---|---|---|---|
| nameplate.html:18 | 返回客製款式 | 返回 | Back | 统一 |
| :21 名牌 h1 | 客製你的名牌。 | （不变） | Make it yours. | 已短 |
| :22 名牌副标 | 選一款造型和尺寸，為你的名字配上喜歡的顏色。 | 選造型和尺寸，再配顏色。 | Pick a shape and size, then the colors. | 缩短 |
| :26 按壓 h1 | 客製你的姓名按壓款。 | 客製你的按壓款。 | Make your clicker. | 「姓名」多余 |
| :27 按壓副标 | 選鍵帽款式，加入姓名和配色，試按你的 3D 預覽。 | 選鍵帽、打名字、配顏色，在 3D 裡按按看。 | Pick keycaps, add your name and colors, and press it in 3D. | 口语 |
| :31 关节 h1 | 客製你的關節字塊。 | （不变） | Make your letters. | — |
| :32 关节副标 | 輸入名字、選好配色，查看字塊和卡扣的 3D 結構。 | 打名字、配顏色，轉一圈看卡扣。 | Add your name and colors, then spin to see the joints. | 缩短 |
| :39 / :162 按钮 | 重置視角 | 重置 | Reset | 统一 |
| :162 按钮（切换） | 檢視鍵軸 / 顯示鍵帽 | 看鍵軸 / 看鍵帽 | Switches / Keycaps | 2–3 字 |
| :54 提示（名牌） | 拖動旋轉 · 捏合縮放 | 拖曳旋轉 · 雙指縮放 | Drag to rotate · Pinch to zoom | 台湾用语 |
| :166 提示（按壓） | 拖動旋轉 · 捏合縮放 · 點按鍵帽 / …· 點按姓名面板 | 拖曳旋轉 · 雙指縮放 · 點鍵帽 / …· 點名字 | … · Tap a key / … · Tap the name | 台湾用语、缩短 |
| :41 / :163 `aria-label` | 3D 預覽，拖曳或使用方向鍵旋轉 / 3D 按壓款預覽，可拖動旋轉與縮放 | 3D 預覽，可拖曳或用方向鍵旋轉 | 3D preview. Drag or use arrow keys to rotate. | 两处统一 |
| :57 / :169 免责 | 畫面為設計示意，實際成品顏色與尺寸依製作確認為準。 | 示意圖，實際顏色和尺寸以成品為準。 | Preview only. Final colors and size may vary. | 意思不变，缩短 |
| :55 状态 | 正在生成輪廓… | 生成中… | Generating… | 去「正在」 |
| :55 / :168 错误 | 所選字型不支援這些文字，請更換字型或姓名。 | 這個字型打不出這些字，換個字型試試。 | This font can't show these characters. Try another font. | 第一人称口语 |
| :55 错误 | 這組文字無法生成完整底板，請縮短姓名或換一種造型。 | 底板做不出來，縮短名字或換個造型。 | The base won't fit. Shorten the name or try another shape. | 缩短 |
| :55 错误 | 關節字塊最多 8 字，空格不計。 | 最多 8 字，空格不算。 | Up to 8 characters, spaces not counted. | 「關節字塊」所在模式已知 |
| :168 错误 | 3D 預覽載入失敗，請再試一次。 | 3D 載入失敗，再試一次。 | 3D failed to load. Try again. | 统一收尾 |
| :168 错误 | 目前瀏覽器無法顯示 3D，請使用支援 WebGL 的瀏覽器。 | 這個瀏覽器不支援 3D（WebGL），換一個試試。 | This browser doesn't support 3D (WebGL). Try another. | 去「目前」「請使用」 |
| :153 错误 | 預覽圖生成失敗，請再試一次。 | 預覽圖生成失敗，再試一次。 | Couldn't create the preview. Try again. | 统一 |

### 6.3 名牌款面板

| 位置 | 现在（繁中） | 改成（繁中） | 英文改成 | 理由 |
|---|---|---|---|---|
| nameplate.html:62 | 姓名與字型 | 名字與字型 | Name & font | 「姓名」→「名字」全站统一 |
| :64 | 姓名文字 | 名字 | Name | 统一 |
| :66 | 單一字塊規格，整串長度隨字數與字形變化。 | 長度隨字數和字形變化。 | Length varies with the letters. | 缩短 |
| :69 | 字形風格 | 字型 | Font | 与其他模式统一 |
| :100/:104 步骤 | 款式與尺寸 | （不变） | Style & size | — |
| :101/:126 步骤 | 選顏色 | 配色 | Colors | 统一 |
| :118 | 尺寸規格 | 尺寸 | Size | 求短 |
| :123 | 以上為長寬上限。隨字輪廓的實際尺寸會依字形調整。 | 以上為最大尺寸；隨字輪廓依字形而定。 | Maximum sizes. Contour size depends on the letters. | 缩短 |
| :128 | 字塊顏色 | （不变） | Letter color | — |
| :132–133 | 凸字顏色 / 字面顏色 | 字色 | Text color | 同一东西两个叫法 |
| :135 | 增加底板顏色 / 增加底層顏色 | 加底色 | Add base color | 统一、求短 |
| :137–138 | 底板顏色 / 底層顏色 | 底色 | Base color | 统一 |
| :149 摘要标题 | 訂單摘要 | 摘要 | Summary | 还没下单，「訂單」不准确 |
| :149 确认勾选 | 名字會照你輸入的內容製作，請確認拼寫。 | 拼寫我確認過了 | I've checked the spelling | 勾选框应是确认句；FAQ 已解释 |
| :149 价格标签 | 預估價格 | 預估 | Est. | 「價格」由 NT$ 自明；「預估」事实保留 |
| :149 主按钮 | 提交確認 | 提交 | Submit | Ken 点名 |
| :151 | 下載 PNG | （不变） | Download PNG | — |
| :152 | 前往付款 | 付款 | Pay | 统一 |
| :153 状态 | 已確認。可下載 PNG，付款暫未開放。 | 已確認，可下載 PNG；付款還沒開放。 | Confirmed. Download the PNG — payment isn't open yet. | 口语 |

### 6.4 按壓款面板

| 位置 | 现在（繁中） | 改成（繁中） | 英文改成 | 理由 |
|---|---|---|---|---|
| nameplate.html:174 面板标题 | 姓名按壓款 | 按壓款 | Clicker | 与 tab 名一致 |
| :176 | 按壓款式 | 款式 | Style | 所在面板已是按壓款 |
| :177–178 | 機械鍵盤款 / 連字按壓款 | 鍵盤款 / 連字款 | Keyboard / Joined | 选项按钮求短（需同步改 :252 价格文字与结账摘要里的款名） |
| :182 | 按鍵與文字 | 按鍵 | Keys | 求短 |
| :191–192 `aria-label` | 增加一格 / 減少一格 | 加一格 / 減一格 | Add key / Remove key | 求短 |
| :199 | 設定按鍵 {n} | 按鍵 {n} | Key {n} | 求短 |
| :200 / :228 | 字型 / 整組字型 | 字型 | Font | 统一 |
| :203 / :207 / :216 | 鍵帽顏色 / 文字顏色 / 底座顏色 | 鍵帽色 / 字色 / 底座色 | Keycap / Text / Base | 求短，与名牌款「字色」统一 |
| :223 | 姓名或文字 | 名字 | Name | 统一 |
| :224 占位符 | 好物 | （不变） | OGS | — |
| :225 | 中文最多 5 字，英文最多 8 個字母。 | 中文 5 字、英文 8 字母以內。 | Up to 5 Chinese or 8 English characters. | 缩短，限制不变 |
| :226 错误 | 文字超過長度上限，請縮短後再試。 | 太長了，縮短一點。 | Too long — shorten it. | 口语 |
| :237 / :242 | 內底顏色 / 外框顏色 | 內底色 / 外框色 | Inner / Border | 求短 |
| :248 | 商品金額 | 價格 | Price | 求短 |
| :251 摘要 | 訂單摘要 / 名字會照你輸入的內容製作，請確認拼寫。 | 摘要 / 拼寫我確認過了 | Summary / I've checked the spelling | 同 6.3 |
| :252 | 3 天內出貨 | （不变） | Ships in 3 days | — |
| :252 | 連字按壓款 NT$80 起 | 連字款 NT$80 起 | Joined from NT$80 | 跟随款名；价格不变 |
| :252 按钮 | 前往下單 | 購買 | Buy | Ken 点名 |
| :252 按钮 | 提交確認 | 提交 | Submit | Ken 点名 |
| keyring-clicker.js:293 邮件状态 | 請在郵件程式中寄出設計資料給我們。 | 在郵件 App 按寄出就完成了。 | Hit send in your email app and you're done. | 去「請」，第一人称 |
| keyring-clicker.js:290 邮件主旨 | OGS 客製設計確認 | OGS 客製設計 | OGS custom design | 去「確認」 |

## 7. 关于 about.html

| 位置 | 现在（繁中） | 改成（繁中） | 英文改成 | 理由 |
|---|---|---|---|---|
| :5 hero | 紓壓、有趣，自成一格。　用認真設計的小東西，為生活留一點輕鬆。 | （不变） | （不变） | 品牌语 |
| :5 第二段标题 | 認真設計，輕鬆一點。 | （不变） | — | — |
| :5 品牌介绍首句 | One Goods Studio 是一個以原創 3D 列印小物為核心的獨立設計品牌。 | One Goods Studio 是做原創 3D 列印小物的獨立品牌。 | One Goods Studio is an independent brand making original 3D-printed little things. | 去「以…為核心」 |
| :5 段尾 | 紓壓、有趣，自成一格。（logo 下重复） | 删除 | 删除 | hero 和页脚已各出现一次 |
| :6 三点小标说明 | 圍繞原創 3D 列印設計，探索小物的造型和玩法。 / 關注按下去、轉起來時，人與物件之間的小小互動。 / 在桌面、包上或手邊，讓喜歡的小東西陪伴生活。 | 原創設計，自己畫、自己印。 / 按下去、轉起來的那一下。 / 放桌上、掛包上、握在手裡。 | We design and print our own. / That little press, that little spin. / On your desk, your bag, in your hand. | 第一人称、去说明腔 |
| :6 FAQ 按壓和旋轉 答 | 是的。按壓系列著重機械按鍵的觸感；旋轉系列著重手指轉動的玩法。具體結構與配件以對應商品說明為準。 | 對。按壓系列玩按鍵手感，旋轉系列玩指尖轉動；細節看各商品頁。 | Yes. Press is about key feel; spin is about fingertip spinning. See each product for details. | 缩短 |
| :7 按钮 | 繼續逛逛 | 逛好物 | Shop | 统一 |
| :7 按钮 | 在 Instagram 認識 OGS | Instagram | Instagram | 按钮求短 |
| :2 meta | 認識 One Goods Studio，一個圍繞原創 3D 列印小物的獨立設計品牌。 | One Goods Studio：原創 3D 列印小物的獨立品牌。 | One Goods Studio: an independent brand for original 3D-printed things. | 缩短（注意 purchase-policy、privacy 页误用了这句 meta，见第 8 节） |

## 8. 售后说明 purchase-policy.html／隐私 privacy.html

| 位置 | 现在（繁中） | 改成（繁中） | 英文改成 | 理由 |
|---|---|---|---|---|
| purchase-policy.html:2 meta | （误用 about 页的品牌介绍句） | 購買方式、運費、出貨與退換貨說明。 | How to buy, shipping, dispatch and returns. | meta 内容和页面不符 |
| :6 页内目录 | 目前購買方式 / 配送方式與運費 / 出貨時間 / 客製商品注意事項 / 退貨與退款 / 數位檔案與授權 / Google 地址搜尋 / 聯絡方式 | 怎麼買 / 運費 / 出貨 / 客製商品 / 退貨退款 / 數位檔案 / 地址搜尋 / 聯絡 | How to buy / Shipping / Dispatch / Custom items / Returns / Digital files / Address search / Contact | 目录求短；节标题同步 |
| :7 怎麼買 内文 | ⚠️ 见待确认 C1 | — | — | 涉及付款 |
| :9 出貨時間 | 客製商品 3 天內出貨。 | （不变） | Custom items ship within 3 days. | — |
| :10 客製商品 第一句 | 客製商品依你送出的設計製作，名字會照你輸入的內容製作，送出前請確認拼寫、字型與顏色。 | 客製商品照你送出的設計製作，送出前看清拼寫、字型和顏色。 | Custom items are made exactly as submitted. Check spelling, font and colors first. | 「製作」说了两次 |
| :10 客製商品 第二句 | 客製商品如涉及解除權例外，須於下單前另行告知，依個別訂單與適用法規處理。 | ⚠️ 见待确认 C2 | — | 法规文字，且与 :11 重复 |
| :11 退貨與退款 | 一般通訊交易商品依台灣消費者保護法辦理…／商品瑕疵、破損… | 不动 | 不动 | 法规与售后实质，保留原文 |
| :12 數位檔案與授權 | 數位檔案的用途及商業使用範圍，以各設計的授權內容為準。購買前請確認檔案格式、所需配件及列印設備。 | 用途與商用範圍以各設計的授權為準；購買前看清格式、配件和列印設備。 | Use and commercial rights follow each design's license. Check format, parts and printer first. | 缩短，意思不变 |
| :13 Google 地址搜尋 | 使用選填的地址搜尋時…此功能適用 Google Maps 服務條款及 Google 隱私權政策。 | 不动 | 不动 | Google 条款要求的披露文字 |
| :14 聯絡方式 | 商品、客製或訂單問題，請寄信至客服信箱或來電。 | 寄信或打電話都可以。 | Email or call us. | 去「請」 |
| :14 | 客服信箱 / 客服電話 | 信箱 / 電話 | Email / Phone | 统一；信箱电话号码不变 |
| privacy.html 全文 | 隱私權說明 各段 | 不动 | 不动 | 个资法相关，保留原文；仅 :2 meta 同上改为「我們如何使用你的資料。」/ How we use your information. |


## 9. 涉及结账流程，待 Ken 确认（本轮不要改）

> 全部「**涉及结账流程，Ken 确认后才改**」。下表只是建议。

| 编号 | 位置 | 现在（繁中） | 建议（繁中） | 英文建议 | 理由 |
|---|---|---|---|---|---|
| K1 | checkout.html:7/:18 标题 | 官網結帳 | 結帳 | Checkout | 人已在官网 |
| K2 | :17 | 返回商品 | 返回 | Back | 统一 |
| K3 | :19 / app.js:488 | 線上刷卡付款開通中，目前可透過蝦皮或賣貨便購買。 | 刷卡即將開放，現在可到蝦皮或賣貨便購買。 | Card payment is coming soon. For now, buy on Shopee or MyShip. | 缩短，事实不变 |
| K4 | :20 | 正在載入商品… | 載入中… | Loading… | 去「正在」 |
| K5 | :30 + :33 | 選擇配送（步骤名与区块标题重复） | 只留一个：配送 | Delivery | 同屏说两次 |
| K6 | :36 / app.js:272 | 7-ELEVEN 超商取貨 · NT$60 | 7-ELEVEN 取貨 · NT$60 | 7-ELEVEN pickup · NT$60 | 运费不变 |
| K7 | :41 / :43 / :44 | 門市名稱、店號或地址 / 請輸入至少兩個字 / 搜尋門市 | 門市名稱、店號或地址 / 至少 2 個字 / 搜尋 | Store name, ID or address / At least 2 characters / Search | 去「請」 |
| K8 | :49 / app.js:304 | 選擇取貨門市 / 更換取貨門市 | 選門市 / 換門市 | Choose store / Change store | 按钮 2–3 字 |
| K9 | :62 / :64 | 地址搜尋（選填） / 輸入街道或地點，選擇結果後自動帶入地址；也可直接填寫下方欄位。 | 地址搜尋（選填） / 搜街道或地點，選了自動填入；也可以直接填下面。 | Address search (optional) / Search a street or place to auto-fill, or type below. | 缩短 |
| K10 | :68 | 搜尋內容會傳送至 Google。使用地址搜尋即適用 Google Maps 服務條款 及 Google 隱私權政策 。請確認門牌與樓層後再下單。 | 前两句不动（Google 披露）；末句改「下單前再看一次門牌和樓層。」 | Check the house number and floor before ordering. | 法规文字保留，只改提醒句 |
| K11 | :73 | 選擇行政區後自動帶入 3 碼郵遞區號。 | 選行政區後自動填入。 | Filled in after you pick a district. | 缩短 |
| K12 | :70–71 | 請選擇縣市 / 請選擇行政區 | 縣市 / 行政區 | City / District | 下拉占位去「請選擇」 |
| K13 | :80/:85 | 確認訂單內容 | 確認訂單 | Review order | 去「內容」 |
| K14 | :81 | 返回購物袋 | 返回 | Back | 统一 |
| K15 | app.js:267 | 前往綠界付款 | 付款 | Pay | 统一；可在按钮下加小字「由綠界處理」 |
| K16 | :90 | 修改配送 | 修改 | Edit | 求短 |
| K17 | app.js:228 | 這件商品目前無法在官網下單。　返回好物 | 這件商品暫不開放購買。　返回好物 | This item isn't available to buy. · Back to shop | 统一「購買」 |
| K18 | app.js:335–477 门市/运费错误 | 請輸入至少兩個字。/ 正在搜尋門市… / 請選擇取貨門市。/ 找不到門市，請換個關鍵字。/ 暫時無法選擇這個門市，請重試。/ 暫時無法搜尋門市，請重試。/ 暫時無法打開取貨門市，請重試。/ 請重新選擇取貨門市。/ 請先選擇取貨門市。/ 暫時無法核對運費，請重試。/ 商品或運費已變更，請重新整理後確認。 | 至少 2 個字。/ 搜尋中… / 選一間門市。/ 找不到門市，換個關鍵字。/ 這間門市選不了，再試一次。/ 門市搜尋失敗，再試一次。/ 選店頁打不開，再試一次。/ 重新選一次門市。/ 先選門市。/ 運費核對失敗，再試一次。/ 價格或運費有變動，重新整理後再確認。 | At least 2 characters. / Searching… / Choose a store. / No stores found. Try another keyword. / Couldn't select this store. Try again. / Store search failed. Try again. / Couldn't open store selection. Try again. / Choose your store again. / Choose a store first. / Couldn't check shipping. Try again. / Price or shipping changed. Refresh and review. | 去「請」「暫時」，统一「再試一次」 |
| K19 | app.js:508–514 | 目前無法前往付款。 | 暫時無法付款。 | Payment is unavailable right now. | 缩短 |
| K20 | checkout-address-search.js:17–58 | 正在帶入地址… / 已帶入地址，請確認門牌，並補上樓層或室號。/ 這個地址不在目前配送範圍，請直接填寫下方欄位。/ 暫時無法搜尋地址，請直接填寫下方欄位。/ 沒有找到地址，請繼續輸入或直接填寫下方欄位。 | 填入中… / 已填入，補上樓層或室號。/ 這個地址不在配送範圍，請手動填寫。/ 地址搜尋失敗，直接填下面。/ 找不到，多打幾個字或直接填下面。 | Filling in… / Done — add floor or unit. / Outside our delivery area. Fill it in manually. / Search failed. Fill in below. / No match. Type more or fill in below. | 缩短 |
| K21 | checkout-preview.js:95 步骤标题 | 購物袋 / 填寫配送資料 / 確認訂單 / 付款 / 訂單完成 | 購物袋 / 配送 / 確認 / 付款 / 完成 | Bag / Delivery / Review / Payment / Done | 步骤名求短 |
| K22 | checkout-preview.js:117 | 選擇配送後顯示 | 選配送後顯示 | After delivery is chosen | 缩短 |
| K23 | checkout-preview.js:124 | 返回修改設計 / 返回商品 | 改設計 / 返回 | Edit design / Back | 统一 |
| K24 | checkout-preview.js:380 | 付款失敗，可重新嘗試 | 付款失敗，再試一次 | Payment failed. Try again. | 统一 |
| — | 内部测试文字（app.js:209/263、internal-checkout.html、「模擬付款」「測試」系列） | 不改 | — | 只有管理员看得到，不在本次范围 |
| C1 | index.html:45 弹窗、purchase-policy.html:7 怎麼買 | 官網下單可用信用卡付款（綠界），也可以透過 7-11 賣貨便或蝦皮購買。商品價格、配送費、出貨時間及隨附內容，請以下單頁面與結帳確認資料為準。 | 官網可刷卡（綠界），也可在 7-11 賣貨便或蝦皮購買。價格、運費、出貨時間和內容物，以下單頁與結帳畫面為準。 | Pay by card here (ECPay), or buy on 7-11 MyShip or Shopee. Prices, shipping, dispatch time and contents follow the order and checkout pages. | 付款说明，意思不变只缩措辞；⚠️ 另注意结账页 K3 说「刷卡開通中」，与这里「可刷卡」**事实互相矛盾**，需 Ken 定哪个是现况 |
| C2 | purchase-policy.html:10 与 :11 | 「客製商品如涉及解除權例外，須於下單前另行告知，依個別訂單與適用法規處理。」同页出现两次 | 只保留在「退貨退款」一节 | — | 法规文字只删重复，不改措辞 |

## 交付要求

1. **三语都改**：改 `src/` 源文字（简中）时，同步改 `translations.json` 的 key 和 `[繁, 英]` value；`nameplate.js` / `custom-types.js` / `keyring-clicker.js` 改行内三语数组。改完跑 `python3 build.py`。
2. **漏翻检查**：英文页（`public/en/*.html` 与 `public/en/app.js`）不应出现任何中文字符（商品名、平台名「賣貨便」「蝦皮」、字型名除外）；用 `grep -P '[\x{4e00}-\x{9fff}]'` 逐个列出并说明残留原因。
3. **繁中检查**：对 `public/*.html` 与 `public/app.js` 用 OpenCC（`s2twp`）比对，转换前后应无差异 = 繁中页无简体字；贴出检查命令和结果。
4. **全站统一检查**：繁中页 grep 以下旧说法，结果应为 0（第 9 节结账相关除外）：`官網下單`、`前往下單`、`提交確認`、`開始客製`、`看全部好物`、`商品圖為 3D 預覽渲染`、`重置視角`、`拖動旋轉`、`捏合縮放`、`其他購買平台`。
5. **截图回报**：首页、好物列表、Keynade MX 商品页、客製页三个 tab（名牌／按壓／關節字塊）、售后说明页，各出繁中 1440 与 390 全页图，英文页至少首页＋商品页＋客製页；放 `review/` 并在回报里列路径。
6. 只改文案，不动排版、样式、结账逻辑；如某条改动会导致布局换行异常，回报出来，不要自行改设计。
