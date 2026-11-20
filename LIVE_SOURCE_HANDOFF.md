# onegoods.studio 正式源碼快照

日期為 2026-11-20，交接分支為 live-source-20261120。

## 源碼與線上核對

正式發布使用的本地 checkout 為
/Users/kylin/Documents/ChatGPT/网站设计/work/ogs-contact-review

本次交接 checkout 為
/Users/kylin/Documents/ChatGPT/网站设计/work/live-source-20261120

基準 commit 為 9a932da9b4840408ffebbe68b0d1924fd5d401ef，最近可用發布紀錄為 Sites v98。
以瀏覽器取得正式站 /、/checkout.html、/custom 的原始 HTML，僅移除 Cloudflare 動態注入的 challenge script 後，三頁均與本地 public 檔案逐字一致。
已核對「客服信箱／客服電話」與「線上刷卡付款開通中，目前可透過蝦皮或賣貨便購買。」文案。

OGStudio/website 是較舊且另有未提交修改的副本，未混入本次快照。
og-upgrade-r1 是另一個未上正式站的預覽分支，未合併入本次快照。
原正式 checkout 沒有待提交修改。初次快照僅補強 .gitignore 並新增交接文件；後續補上本地設定範本、初始化工具與開發文件，詳見 LOCAL_DEVELOPMENT.md。

## 正式部署方式

- 執行環境為 Cloudflare Workers，搭配靜態 Assets、D1 與 R2。
- Sites 專案名稱為 One Goods Studio。
- Sites 專案 ID 為 appgprj_6ae2086cabe08191b93babd61954edd2。
- 既有發布回傳的 Cloudflare provider 標識為 site---6ae2086cabe08191b93babd61954edd2。
- 正式網址為 https://onegoods.studio。
- 正式站由 Sites 工具手動保存版本、發布；不是向本 GitHub 儲存庫 push 後自動部署。
- 本次沒有呼叫任何保存發布版本、部署或環境變數修改操作。

正式站歷來沒有使用一條 wrangler deploy shell 命令。因此沒有可如實列出的「正式站 wrangler 部署命令」。
不要把前一輪 onegoods-review Pages 專案的 wrangler pages deploy 命令當成正式站部署方式。

實際使用過的本地封裝 helper 命令為：

    node /Users/kylin/.codex/plugins/cache/openai-curated-remote/sites/1.1.7/scripts/site-workflow.mjs --project-id appgprj_6ae2086cabe08191b93babd61954edd2

該 helper 接受透過 stdin 傳入的短期源碼憑證與建置／封裝參數，負責準備源碼與封裝，不能單憑這行命令完成正式發布。憑證不隨 Git 交接。
封裝完成後，正式發布透過 Sites 的 save_site_version，再 deploy_site_version，傳入相同專案、已推送的完整 commit、封裝檔與返回的 saved version ID。

## Build 與輸出

Node.js 需求見 package.json，目前為 >=22.13.0。
Python build.py 使用 opencc-python-reimplemented；本地依賴已鎖定在 requirements-local.txt。

首次本地啟動請執行 npm ci、npm run setup:local、npm run dev。完整步驟與本地 D1 初始化方式見 LOCAL_DEVELOPMENT.md。

手動建置步驟為：

    npm ci
    python3 -m venv .venv
    .venv/bin/pip install -r requirements-local.txt
    .venv/bin/python build.py
    npm run build

- build.py 從 src/ 產生 public/ 下的三語 HTML、JS、CSS 與共用管理端資產。
- npm run build 透過 scripts/run-framework.mjs 執行 Vinext/Vite 的 Worker 建置。
- Worker 入口為 dist/server/index.js。
- 部署用靜態 Assets 位於 dist/client/。
- build 會產生 dist/server/wrangler.json，該目錄受 Git 忽略。
- 源碼根目錄沒有正式 wrangler.toml 或 wrangler.jsonc；新增的 wrangler.local.jsonc 僅供本地 D1 初始化使用。
- 源碼設定來自 .openai/hosting.json、vite.config.ts 與 worker/index.ts。
- 產生的 wrangler.json 使用本機 placeholder 資源設定，不能視為正式帳號與資料庫資源的完整部署設定。

## 環境變數與服務綁定

以下只列源碼實際引用的變數名稱。Sites 管理工具目前連線失敗，無法重新讀取正式 runtime 已設定的名稱集合，不能將此清單當成已逐一確認開通的正式設定。

- OGS_ADMIN_EMAILS
- OGS_ECPAY_STAGE_RETURN_URL
- OGS_ECPAY_MAP_RETURN_URL
- OGS_ECPAY_LOGISTICS_STAGE_RETURN_URL
- OGS_GOOGLE_PLACES_KEY
- OGS_ECPAY_PAYMENT_MERCHANT_ID
- OGS_ECPAY_PAYMENT_HASH_KEY
- OGS_ECPAY_PAYMENT_HASH_IV
- OGS_STORE_HOME_SHIPPING_FEE
- OGS_ECPAY_LOGISTICS_MERCHANT_ID
- OGS_ECPAY_LOGISTICS_HASH_KEY
- OGS_ECPAY_LOGISTICS_HASH_IV
- OGS_ECPAY_LOGISTICS_RETURN_URL

服務綁定名稱為 DB、BUCKET、ASSETS、CONNECTORS。
import.meta.env.DEV 是建置旗標，不是需填寫的商店 runtime secret。
後台登入使用 Sites 提供的 ChatGPT 認證 header；若日後改成自行託管，需另行處理認證與資源綁定。

## 安全與交接界線

已使用校驗官方 release checksum 的 Gitleaks v8.30.1 掃描會推送的正式版歷史及工作目錄，未發現密鑰。
同時檢查了歷史檔名，沒有 .env、.dev.vars、.wrangler 憑證目錄或私鑰檔被追蹤的紀錄。
.env*、.dev.vars*、.wrangler 與常見本機憑證格式受 .gitignore 忽略；本次交接不包含正式 secret 值。
這是掃描結果，不表示已重查所有外部服務設定。

正式商品資料與訂單保存在 D1，上傳圖片／附件保存在 R2。Git 快照含程式、靜態資產與 seed，未匯出正式資料庫、訂單或 R2。
