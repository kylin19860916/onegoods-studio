# Google address search — 2026-11-24

Project: `OGS Address Search` (`ogs-address-search`). Only Places API (New) is enabled for this integration. Its key is restricted to that API and stored only in the hosting runtime secret `OGS_GOOGLE_PLACES_KEY`. Never commit a real key in local environment files. This server-side key is not a browser/referrer key.

`OGS_GOOGLE_PLACES_ENABLED=true` enables optional checkout search. Local templates default to false. Restart/redeploy a saved version to apply runtime changes. Existing credit-card collection and NT$100 mainland home-delivery configuration are independent.

Public checkout calls same-origin `/api/address-search/config` and POST `/api/address-search/places`. Worker calls Autocomplete and Place Details with one session token, Taiwan region restriction, and minimal masks. Details use only `formattedAddress,addressComponents`. No map, Geocoding API, GPS permission or browser key is needed.

County/district/postcode are reconciled against the existing Taiwan postal dataset. Unsupported offshore districts are rejected. Google suggestions do not guarantee deliverability or the existence of a house number; the buyer must confirm street, number and floor. Floor/unit is not overwritten. Buyers can always type the address manually. Out-of-order searches are cancelled and cannot overwrite manual edits.

Migration `0007_google_places_usage.sql` stores atomic counters only: salted/truncated IP hash per minute and UTC-month totals, with expiry. No query, raw IP, key or Google result list is stored. Order storage contains the buyer-confirmed address. Privacy and purchase-policy pages link the Google terms/privacy. Official Google Maps attribution SVG is unmodified, sourced from https://developers.google.com/static/maps/documentation/images/Google_Maps_Attribution_Assets.zip.

Application limits: 20 upstream requests per IP per minute and 3,000 per UTC month for this site's shared Google integration. Every autocomplete/detail attempt, including upstream failures, consumes a counter. The private preview uses the same guard. Missing migration/database, Google errors or exhausted limits fall back to manual entry. This caps this application, not other Google projects, direct key usage or an entire billing account. It is not a Google monetary billing cap.

Checks: `node tests/address-search.mjs`, `node tests/taiwan-address.mjs`, `node tests/store-payment-integration.mjs`, TypeScript check, repeat static build. Tests use mocked Google and a temporary local D1; no real payment or shipment. Browser fixture confirmed address fill and floor preservation. Production verification is recorded below after publication.

## Production verification

Published version **101**, hosting source `f4e4135114dcecb293f9d9766b9aee82386349c4`, environment revision **9**. Deployment `appgdep_6b046811300081919f900a45621708fd` succeeded. Live database overview confirms `google_places_usage` exists.

On https://onegoods.studio/checkout?product=keynade-mx, searched the public address `臺北市南港區三重路19之2號`. Real Google autocomplete returned `臺北市南港區三重里三重路19之2號`; real Place Details filled `臺北市 / 南港區 / 115 / 三重里三重路19之2號`. Synthetic `3樓` remained intact. Google Maps logo loaded. The page HTML contained no Google API key. The product/fee/total remained NT$499 / NT$100 / NT$599. Search config is enabled; existing payment config remains enabled with shipping 100. No order was submitted, card charged, or shipment created.

Screenshot: workspace `outputs/google-address-live-20261124.jpg` (not committed).
