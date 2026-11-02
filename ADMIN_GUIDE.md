# OGS 商品與設計檔案管理

入口：`/admin`。使用目前網站擁有者的 ChatGPT 帳號登入；管理者名單在 Sites 的 `OGS_ADMIN_EMAILS` 執行環境設定中維護。

- **實體商品**：名稱、玩法、TWD售價、介紹、隨附內容、規格、圖片排序與賣貨便商品連結。
- **設計檔案**：獨立資料區，含版本、授權、列印／組裝說明、MakerWorld連結及私人附件。
- **展示狀態**：草稿、前台展示中、封存。封存可復原；不永久刪除。
- **銷售狀態**：尚未開售、已開售。前台展示不會自動開售。實體商品已開售需有效賣貨便連結；設計需有效MakerWorld連結。
- **圖片**：JPEG／PNG／WebP，每張10MB、每筆最多12張；第一張為主圖，上傳後需儲存。
- **設計附件**：STL／3MF／PDF／ZIP／STEP／STP／OBJ，每個30MB，僅管理者可下載。新增公開或付費檔案交付需要另行實作。
- **語言**：繁體為預設，可填簡體／英文欄位；未填欄位使用繁體，不自動翻譯。
- **備份**：匯出商品JSON，附件需另外下載保管；不宣稱JSON包含附件二進位檔。

資料存於Sites提供的D1，檔案存於R2，不使用瀏覽器localStorage作商品資料庫。首次成功登入后台會以INSERT OR IGNORE匯入原有4筆資料，不覆寫後續修改。Keynade MX為既有正式產品，其餘保留為類別示意。

開發：`python3 build.py` 產生public/三語靜態前台與admin資產，`npm run dev` 預覽，Sites build helper建置Worker。SQL與Drizzle快照在drizzle/。本機驗證工具：`python3 tests/cms-integration.py`（僅使用loopback測試資料庫）；不要對正式站執行測試新增。

正式環境不包含本機模擬登入。權限、輸入驗證、來源檢查與版本衝突均由伺服器處理。前台只讀published資料，內部備註／附件ID不公開，草稿與封存圖片不供匿名取用。
