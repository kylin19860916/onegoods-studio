# Taiwan checkout address data

Source: Chunghwa Post official downloads, item 8.1, 3-digit postal code / administrative district center table.
https://www.post.gov.tw/post/internet/Download/all_list.jsp
https://www.post.gov.tw/post/download/1050812_%E8%A1%8C%E6%94%BF%E5%8D%80%E7%B6%93%E7%B7%AF%E5%BA%A6%28toPost%29.xml

Retrieved 2026-11-23. Source dataset date: 2016-08-12. Source is the postal service's still-published download; retain the date instead of presenting it as a new 2026 survey. 22 cities/counties, 371 postal entries including Diaoyutai, Dongsha and Nansha. Only district names and 3-digit prefixes are bundled, not coordinates. Refresh this snapshot when official administrative divisions change.

The checkout retains its existing Taiwan-main-island delivery scope: 19 cities/counties, excluding Penghu/Kinmen/Lienchiang and offshore districts Diaoyutai/Dongsha/Nansha/Ludao/Lanyu/Liuqiu. This is a shipping policy filter, not a claim that those places do not exist. One shared dataset feeds the frontend choices and backend city/district/postcode-prefix checks. Three-digit codes identify districts; they do not verify street numbers or the last digits of 3+2 / 3+3 postcodes. Street and house number remain user-entered; floor/unit remain optional.

Source SHA256: 5bdc716df9170166b3e62183a38b69851ca1d95208964485a3d8cc291316a8d7

## Production release verification

Published on onegoods.studio as Sites v100, source `435f561564b11aa656fe705eb858f2abe0dacf66`, deployment `appgdep_6b045ebaf3ec81919b2e28c08ce6630b`, keeping payment environment revision 7 unchanged. Production browser check: 臺北市 → 南港區 fills 115; the credit-payment button remains active and Keynade MX totals NT$599 including home delivery. No order, charge or logistics shipment was created. Local UI checks covered county changes clearing stale district/postcode, English/Traditional/Simplified checkout pages, and 390 px mobile width without overflow. Backend tests cover every source district and reject wrong county/district/postal combinations. Two static builds were byte-identical; typecheck and payment regression passed.

Google Places is not enabled by this change. This local dataset and selector do not make Google API requests or incur Maps API charges.
