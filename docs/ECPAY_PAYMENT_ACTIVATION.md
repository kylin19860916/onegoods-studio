# 綠界正式收款接入與啟用交接

2026-11-23：已登入綠界「驗證／服務申請」頁，確認金流－信用卡收款、金流－非信用卡收款、物流均顯示「已開通」。開通不等於官網實際交易已驗收。

## 本次實際核對

- 正式站 `https://onegoods.studio/api/store-payment/config` 回應 `enabled: false`、`shipping: null`。
- 初次核對時缺少正式金流設定。登入核對後，已將 `OGS_ECPAY_PAYMENT_MERCHANT_ID`、`OGS_ECPAY_PAYMENT_HASH_KEY`、`OGS_ECPAY_PAYMENT_HASH_IV` 存入 Sites 的秘密設定，並明確設定 `OGS_ECPAY_PAYMENT_ENABLED=false`；環境設定版本為 6。未設定正式宅配運費 `OGS_STORE_HOME_SHIPPING_FEE`，沒有部署套用此版本。
- 金流憑證取自「系統介接設定」的「金流、MPOS」列，並非物流列。已驗證欄位／格式及秘密設定保存，尚未透過真實交易驗證憑證。原值未顯示在對話或寫入原始碼，暫時加密傳遞用的金鑰已移除。
- 信用卡交易設定顯示網站為 `https://onegoods.studio`、連續盜刷保護及每日自動關帳已啟用、國外卡交易未開通。此次未修改這些綠界後台設定。
- 正式 D1 的 `DB` 已有 `store_orders` 表；這次只讀取表名，沒有新增、修改正式訂單。
- 既有公開付款流程只支援實體商品、信用卡一次付清、台灣本島黑貓宅配；它會移除超商選項。超商選店與客製流程仍是測試流程。此分支不把它們直接轉成正式收款，也不建立正式物流單。

## 本分支補上的保護

- 正式環境必須明確設定 `OGS_ECPAY_PAYMENT_ENABLED=true`，同時具備有效金流憑證、D1 與配送運費，才允許建立新的付款請求。僅先準備憑證不會自動開放收款。
- 正式付款不允許由 localhost 啟用。請保留現有管理員測試流程，不把正式金鑰填進 Mac mini 的本地環境。
- 暫停新的收款入口後，既有訂單的有效付款通知仍會驗證並對單，避免停用期間漏記已付訂單。
- 信用卡流程拒絕非信用卡成功通知及無效模擬標記。模擬付款、失敗結果均不得把正式訂單標成已付款。

## 正式伺服器需要的設定（只列名稱）

| 名稱 | 用途 |
|---|---|
| `OGS_ECPAY_PAYMENT_MERCHANT_ID` | 綠界金流特店編號 |
| `OGS_ECPAY_PAYMENT_HASH_KEY` | 正式金流簽章秘密，放 Sites／主機的 secret |
| `OGS_ECPAY_PAYMENT_HASH_IV` | 正式金流簽章秘密，放 Sites／主機的 secret |
| `OGS_STORE_HOME_SHIPPING_FEE` | 經確認的正式黑貓宅配運費，整數新台幣 |
| `OGS_ECPAY_PAYMENT_ENABLED` | 明確控制新收款入口，預設停用 |

整合測試使用商品 NT$499＋宅配 NT$100＝NT$599，全部為本地合成資料；NT$100 不是本次已確認的正式運費。先前 NT$559 是超商運費 NT$60 的另一條測試流程。

正式金流資料應從已登入的綠界商家後台核對，直接存到主機秘密設定；不要貼在聊天、Git、交接文件或前端。物流憑證維持原樣。正式金流秘密已保存至待套用的環境設定版本 6，收款旗標保持 false；正式站即時檢查仍回應 enabled=false、shipping=null。

## API 與回傳

- 收款端點：`https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5`
- 付款方式：現有程式明確使用 `ChoosePayment=Credit`，不等於非信用卡方式已完成接入。
- 伺服器付款通知：`https://onegoods.studio/api/store-payment/notify`。AIO 建單時附上，不要填成物流回傳路徑。
- 瀏覽器返回頁：`https://onegoods.studio/order-receipt.html`（附上原訂單識別及存取 token），畫面返回不得自行把訂單標成付款成功。
- 商家、簽章、交易號、金額及原訂單均須匹配；重複通知不得重複入帳。對通知正確回應 `1|OK`。
- 若通知未到，依官方查單規格補查，不以買家的返回畫面代替付款確認。正式查單／補單工具不在目前既有結帳實作中，正式驗收時應一併處理。

官方依據：[AIO 付款](https://developers.ecpay.com.tw/2864/)、[付款通知](https://developers.ecpay.com.tw/2878/)、[檢查碼](https://developers.ecpay.com.tw/2902/)、[查詢訂單](https://developers.ecpay.com.tw/16579/)。

## 本地驗收與上線邊界

```
node tests/store-payment-integration.mjs
node_modules/.bin/tsc --noEmit
```

測試使用臨時 Miniflare D1、合成特店與隨機假金鑰，沒有呼叫綠界付款、沒有寫正式資料庫。包含官方簽章向量、預設關閉／不完整設定、伺服器計價與價格竄改、同 requestId 冪等、回傳簽章／商家／金額／訂單／付款方式驗證、模擬與失敗狀態、重複通知與交易衝突、暫停時的既有訂單通知、訂單 token 權限、樓層室號保存。

先由 Alpha／Mac mini 驗收開發分支。開通狀態及秘密設定保存已核對；正式運費、配送／客製上線範圍、非信用卡取號與付款通知流程、正式交易及查單驗收仍待完成。Ken 確認正式部署／開啟收款後才執行；本分支推送不代表正式站已啟用，沒有代客刷卡或自動寄件。
