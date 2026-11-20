# Mac mini 本地啟動

使用 Node.js >=22.13 和 Python 3。先確認目前位於 live-source-20261120 分支，並閱讀 LIVE_SOURCE_HANDOFF.md。

    npm ci
    npm run setup:local
    npm run dev

預設網址為 http://localhost:5173，以終端輸出為準。若埠已被使用，可執行 npm run dev -- --port 5399。

## setup:local 做什麼

1. 僅在沒有 .dev.vars 時，從 .dev.vars.example 複製一份。範本只有本地模擬管理員設定；可選整合欄位以註解列出，不含真實憑證。需要測試整合時才取消註解並填入測試設定。
2. 建立 .venv，安裝 requirements-local.txt 的 OpenCC，執行 build.py 產生三語靜態檔案。
3. 透過 wrangler.local.jsonc，按 drizzle/ 的順序套用本地 D1 遷移。腳本固定傳入 --local，資料保存在 .wrangler/state。
4. 不建立或發布雲端專案，不執行正式付款或物流建單。

可重複執行 setup:local。既有 .dev.vars 不會被覆蓋，已套用的遷移不會重跑，資料庫不會被清空。
不要將正式收款／物流憑證複製到本地範本。

## 本地後台與範例商品

開啟 /signin-with-chatgpt?return_to=%2Fadmin。
現有開發登入會使用 seedy@sites.test，僅限本機回環位址。
首次進入後台會以現有的 initialize 流程建立 seed 商品及分類。範例資料與正式商品庫不同。
沒有綠界、Google 或 Cloudflare 真實密鑰，也能先開發前台、3D 客製及本地商品管理。

D1、R2 由 Cloudflare Vite plugin 在本機模擬。wrangler.local.jsonc 的 DB 名稱與 placeholder ID 必須與 vite.config.ts 一致，兩者才能讀取同一本地資料庫。
上傳附件保存在本機 R2 模擬儲存。正式訂單、正式商品資料與既有 R2 圖片不在這份快照中。

## 單獨初始化資料庫

若只需要套用後續新增遷移，可執行：

    npx wrangler d1 migrations apply DB --local --config wrangler.local.jsonc --persist-to .wrangler/state

已存在資料不需要重建。不要刪除 .wrangler/state，也不要將 --local 改為 --remote。

## 開發與建置

修改 src/ 的靜態頁面後，執行：

    .venv/bin/python build.py

必要時另開終端執行上述命令，並重新整理瀏覽器。修改 server/ 或 app/ 時由開發伺服器重新載入。
完整 Worker 建置使用 npm run build，輸出在 dist/。此步驟是本地建置，不會部署。
正式環境的變數名稱及現有部署方式見 LIVE_SOURCE_HANDOFF.md。

## 尚未接入的服務

範本中的綠界金流、物流和 Google Places 欄位預設空白。整合功能需要另外申請測試設定、回傳網址及憑證。
先保留空白；不用填假密鑰，也不用登入 Cloudflare 就能初始化本地 D1。
正式站的 ChatGPT 登入由 Sites 提供，本地模擬登入不代表其他主機已具備正式認證。

.dev.vars、.venv 與 .wrangler 都受 Git 忽略；只有空白範本 .dev.vars.example 可以提交。
