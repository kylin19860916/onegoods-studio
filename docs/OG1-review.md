# OG1 第一輪預覽交接

## 部署與原始碼
- 基準為正式版 Sites v98，commit 9a932da9b4840408ffebbe68b0d1924fd5d401ef。
- 正式站經 Sites 版本發布至 Cloudflare Workers，由平台保存源碼與發布版本。GitHub 不是目前正式站的自動部署觸發器。
- 本輪從實際正式版 checkout 建立 og-upgrade-r1 分支。Git 作者為 kylin1986@gmail.com。
- 預覽是使用本人 Cloudflare 帳號新建的獨立 Cloudflare Pages 專案 onegoods-review，手動部署到 og-upgrade-r1 非 production 分支。
- 預覽 https://og-upgrade-r1.onegoods-review.pages.dev
- 對照圖與原始測試檔 https://og-upgrade-r1.onegoods-review.pages.dev/review/
- 預覽使用已公開商品目錄的唯讀快照及壓縮圖片，不連正式訂單資料庫。未發布正式站，未更改價格與付款／物流程式。

## 已實作
- ACES + sRGB、64px PMREM RoomEnvironment、啞光 PLA 材質及柔和接地陰影。
- 按角度平滑預覽法線；沒有增加會改變製造尺寸的實體倒角。
- 載入後旋轉一圈、拖曳即停止；尊重減少動態效果設定。
- 無效輸入保留最後有效模型；缺字時整組切到思源黑體並顯示提示。
- 字型依 256-codepoint Unicode 區塊載入；保留同分片中的 kerning/ligatures。包含英文 office、Max 及中文姓氏的幾何比較測試。
- 標題字型依目前各語系標題及商品名裁切。字型與 Three.js 所在 bundle 使用內容雜湊及長效快取。
- 0.8 mm 筆畫／0.6 mm 間隙的形態學提示。最小字高暫定 5 mm，均可在 PRINT_LIMITS 調整。
- ?admin=1 開啟本機產檔按鈕；名牌與關節字塊用現有幾何、連字／機械鍵盤款重用既有製造器，在瀏覽器產出分色 3MF。
- 名牌、關節字塊、連字按壓的樣例均實際下載，Bambu Studio CLI 原生讀取結果均為 manifold=yes。尚未實際列印。
- 刪除 Enerkey 頁面的 Roblox RIVALS 造型引用，保留模型作者署名；移除空旋轉分類與首頁相關承諾。
- 產品圖片 WebP 及響應尺寸；繁中轉換與英文「名牌款」漏譯修正。
- 頁尾及商品頁客服聯絡原文和值維持原樣。

## 手機 Lighthouse
本機相同公開目錄快照、gzip、Chrome headless、Lighthouse 預設手機模擬 4G／CPU 4x。不同 run 有波動，原始 JSON 保留。模型畫布的內容完整時間不等同 LCP。

| 頁面 | Performance 前 → 後 | LCP 秒 前 → 後 | 傳輸 MB 前 → 後 |
|---|---:|---:|---:|
| home | 51 → 85 | 35.26 → 3.53 | 8.30 → 0.56 |
| product | 53 → 63 | 34.44 → 3.83 | 7.66 → 0.80 |
| customizer | 69 → 58 | 1.36 → 2.85 | 7.64 → 1.04 |

## 輸入與數位產檔驗證
- 1.6 Mbps、150 ms RTT、CPU 4x、關閉瀏覽器快取。
- 輸入「陳怡君」後模型更新約 0.86 秒，符合 1.5 秒目標。
- 初次完整模型約 7.35 秒；這項不是 LCP，仍有改善空間。
- 客製頁 LCP 約 2.85 秒，符合 3 秒目標；Performance 目前低於舊版，新增 3D 光照與動畫在軟體 GPU/CPU 節流下有成本，應以 Alpha 的真實裝置再驗收。
- 維持前一有效模型、常見姓氏 fallback、390px 橫向溢出檢查通過。
- 使用瀏覽器按鈕下載三款 3MF，並以 Bambu Studio --info 核對分件與 manifold。
- 三款「陳怡君」改前後尺寸一致，見 browser-results*.json。

## 仍需驗收與限制
- 可印性是幾何形態學篩檢，容許極小的尖角／離散化誤差，不是精確局部最小壁厚的證明，也不能取代試印。
- 獨立字鍵款目前沒有已核定且與預覽一致的獨立製造器，沒有以機械鍵盤款的幾何冒充。它的 3MF 匯出尚未納入本輪；連字款及機械鍵盤款可匯出。
- 關節字塊的密集繁中字仍有原版加粗輪廓造成的筆畫辨識風險；本輪沒有修改已存在的製造幾何，應在 Alpha 驗收時一併檢查。
- 原始分色 3MF 可由 Bambu Studio 讀取；沒有做這輪的原生切片或物理裝配／回彈測試。
- 旋轉使用低功耗節奏。沒有聲稱各手機 GPU 的畫面幀率一致。
- 缺少的兩份參考文件 3d_customizer_review.md 和 PLAN_draft.md 未隨本次提供，本輪依 OG1 文件與目前程式實作。

## 重建與發布預覽
Python 工具依 requirements-preview.txt，Node 依 package-lock.json。
已產生的分片與壓縮圖一併入庫；只有修改原始字型／圖片時才需要重新生成。
1. node scripts/build-admin-export.mjs
2. Python build.py（需要 OpenCC）
3. node tests/font-subsets.mjs && node tests/printability.mjs
4. node scripts/package-review-preview.mjs <獨立的 cloudflare-preview 絕對路徑>
5. wrangler pages deploy <上述路徑> --project-name onegoods-review --branch og-upgrade-r1

不要用 Sites 的 deploy_site_version 發布這個預覽分支，那會更新正式站。
