# Official checkout 7-ELEVEN test — 2026-11-24

Scope: add a protected sandbox run to the existing official storefront checkout while preserving the live credit-card/Black Cat home-delivery flow. Do not enable production 7-ELEVEN collection or create a production logistics order.

Test entrance: `/checkout?product=keynade-mx&shipping-test=1`. The browser requests `/api/checkout-preview/config`; server requires an OGS administrator. Anonymous access shows sign-in instead of falling through to live payment. Normal customers continue to use existing live home-delivery checkout. Test checkout visibly identifies ECPay sandbox; it offers 7-ELEVEN NT$60 and home delivery NT$100.

Read-only store selection uses the configured logistics MerchantID at the official e-map. This does not create a logistics order. The random short-lived token binds the selection to the session; the callback retains locale and `shipping-test=1`. A `map=stage` test URL uses the fixed sandbox store instead. A working sandbox merchant does not establish approval of the real merchant's logistics service. Confirm the actual ECPay account separately.

Fixed verification item: Keynade MX NT$499 × 1. Pickup total NT$559; Black Cat total NT$599. The server fetches the catalog price, resolves the stored branch token, checks the submitted total, snapshots the order, and maintains idempotency. Browser labels do not set payment status.

Payment: dedicated `OGS-DEMO-*` order in `checkout_preview_orders`, ECPay `payment-stage` endpoint and public sandbox credentials only. A signed return is checked against the original amount/ID and independently signed query result before recording paymentReference. It never enters live `store_orders`.

Shipping: admin physical-order detail now supports create/query, 12-character handoff code and label print. Uses `logistics-stage` merchant 2000933 only, source order's store ID, GoodsAmount=499 and IsCollection=N. Requires verified sandbox payment, claims order once before upstream request, saves logistics ID/status, verifies signed callbacks against trade/subtype/ID, and includes physical orders in pending exports/batch-label PDF. Live order IDs cannot use this endpoint. No production creation endpoint or automatic shipment was enabled.

Checks: `node tests/seven-checkout-integration.mjs`, `node tests/store-payment-integration.mjs`, `node tests/address-search.mjs`, `node tests/taiwan-address.mjs`, TypeScript, JavaScript syntax, repeat static build and native hosting build. The new integration test uses local D1 and mocked signed ECPay responses, covering admin isolation, real-map request configuration, price, branch, verified payment, idempotent create, callback, code, print and pending export. It is not evidence of a real sandbox transaction or account approval.

Pending live browser verification: actual ECPay logistics approval, official map selection, sandbox payment page amount/return, same-order admin shipment and actual test label. Requires the owner's ECPay and OGS administrator sessions, both expired at start of this task. ECPay test labels may show fixed example data; destination truth must also be checked against the saved order and request payload.
