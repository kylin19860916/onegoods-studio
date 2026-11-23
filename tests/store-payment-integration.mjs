import assert from 'node:assert/strict';
import {readFileSync, mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {randomBytes,randomUUID} from 'node:crypto';
import {build} from 'esbuild';
import {Miniflare} from 'miniflare';
const dir=mkdtempSync(join(tmpdir(),'ogs-payment-'));
await build({entryPoints:['server/store-payment.ts'],outfile:join(dir,'payment.mjs'),bundle:true,platform:'node',format:'esm',define:{'import.meta.env.DEV':'false'}});
const {storePayment,paymentMac}=await import(pathToFileURL(join(dir,'payment.mjs')));
// Published ECPay AIO checksum vector: https://developers.ecpay.com.tw/2902/
assert.equal(await paymentMac({TradeDesc:'促銷方案',PaymentType:'aio',MerchantTradeDate:'2023/03/12 15:30:23',MerchantTradeNo:'ecpay20230312153023',MerchantID:'3002607',ReturnURL:'https://www.ecpay.com.tw/receive.php',ItemName:'Apple iphone 15',TotalAmount:'30000',ChoosePayment:'ALL',EncryptType:'1'},'pwFHCqoQZGmho4w6','EkRm7iFT261dpevs'),'6C51C9E6888DE861FD62FB1DD17029FC742634498FD813DC43D4243B5685B840');
const mf=new Miniflare({modules:true,script:'export default {fetch(){return new Response("test")}}',compatibilityDate:'2026-05-22',d1Databases:['DB'],inspectorPort:0});
try {
const DB=await mf.getD1Database('DB');
await DB.exec('CREATE TABLE catalog (id TEXT, kind TEXT, status TEXT, data TEXT);');
for(const sql of readFileSync('drizzle/0006_wise_paladin.sql','utf8').split('--> statement-breakpoint')) if(sql.trim())await DB.prepare(sql).run();
await DB.prepare('INSERT INTO catalog VALUES (?,?,?,?)').bind('keynade-mx','physical','published',JSON.stringify({name:'Keynade MX',price:499,saleStatus:'available'})).run();
const env={DB,OGS_ECPAY_PAYMENT_ENABLED:'true',OGS_ECPAY_PAYMENT_MERCHANT_ID:'9876543',OGS_ECPAY_PAYMENT_HASH_KEY:randomBytes(8).toString('hex'),OGS_ECPAY_PAYMENT_HASH_IV:randomBytes(8).toString('hex'),OGS_STORE_HOME_SHIPPING_FEE:'100'};
const base='https://onegoods.studio';
const request=(path,body,settings=env)=>storePayment(new Request(base+'/api/store-payment/'+path,body?{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify(body)}:undefined),settings);
const config=async settings=>(await request('config',null,settings)).json();
assert.equal((await config(env)).enabled,true);
for(const invalid of [{OGS_ECPAY_PAYMENT_ENABLED:undefined},{OGS_ECPAY_PAYMENT_ENABLED:'false'},{OGS_ECPAY_PAYMENT_ENABLED:'TRUE'},{OGS_ECPAY_PAYMENT_HASH_KEY:undefined},{OGS_STORE_HOME_SHIPPING_FEE:undefined},{OGS_ECPAY_PAYMENT_MERCHANT_ID:'3002607'}]) assert.equal((await config({...env,...invalid})).enabled,false);
assert.equal((await (await storePayment(new Request('http://localhost:5173/api/store-payment/config'),env)).json()).enabled,undefined); // Production bundle rejects local routes.
const payload={requestId:randomUUID(),productId:'keynade-mx',quantity:1,total:599,city:'臺北市',district:'南港區',postalCode:'115',street:'測試路1號',unit:'3樓之2',contact:'測試收件人',phone:'0900000000',email:'test@example.com'};
for (const invalid of [
 {city:'不存在縣'}, {city:'臺北市',district:'板橋區'}, {district:'__proto__'},
 {postalCode:'100'}, {postalCode:'100000'}, {city:'澎湖縣',district:'馬公市',postalCode:'880'},
 {city:'臺東縣',district:'蘭嶼鄉',postalCode:'952'},
 {city:'屏東縣',district:'琉球鄉',postalCode:'929'},
]) assert.equal((await request('checkout',{...payload,...invalid})).status,400);
assert.equal((await request('checkout',{...payload,total:559})).status,409);
assert.equal((await request('checkout',payload,{...env,OGS_ECPAY_PAYMENT_ENABLED:'false'})).status,503);
const checkout=await (await request('checkout',payload)).json();
assert.equal(checkout.action,'https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5');
assert.equal(checkout.fields.TotalAmount,'599');assert.equal(checkout.fields.ChoosePayment,'Credit');
assert.equal(checkout.fields.ReturnURL,base+'/api/store-payment/notify');
assert.equal(checkout.fields.CheckMacValue,await paymentMac(checkout.fields,env.OGS_ECPAY_PAYMENT_HASH_KEY,env.OGS_ECPAY_PAYMENT_HASH_IV));
assert.equal((await (await request('checkout',payload)).json()).fields.MerchantTradeNo,checkout.fields.MerchantTradeNo);
assert.equal((await request('checkout',{...payload,unit:'4樓'})).status,409);
const orderId=checkout.fields.CustomField1;
const status=async()=> (await request('status?id='+orderId+'&token='+payload.requestId)).json();
const callback=async(changes={},settings=env,duplicate=false)=>{
 const fields={MerchantID:env.OGS_ECPAY_PAYMENT_MERCHANT_ID,MerchantTradeNo:checkout.fields.MerchantTradeNo,TradeAmt:'599',RtnCode:'1',SimulatePaid:'0',TradeNo:'20261123000001',PaymentType:'Credit_CreditCard',CustomField1:orderId,...changes};
 fields.CheckMacValue=await paymentMac(fields,env.OGS_ECPAY_PAYMENT_HASH_KEY,env.OGS_ECPAY_PAYMENT_HASH_IV);
 const body=new URLSearchParams(fields).toString()+(duplicate?'&TradeAmt=599':'');
 return storePayment(new Request(base+'/api/store-payment/notify',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body}),settings);
};
const forged=new URLSearchParams({MerchantID:env.OGS_ECPAY_PAYMENT_MERCHANT_ID,MerchantTradeNo:checkout.fields.MerchantTradeNo,TradeAmt:'599',RtnCode:'1',SimulatePaid:'0',TradeNo:'20261123000001',PaymentType:'Credit_CreditCard',CheckMacValue:'0'.repeat(64)});
assert.equal((await storePayment(new Request(base+'/api/store-payment/notify',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:forged}),env)).status,400);
assert.equal((await callback({MerchantID:'1234567'})).status,400);
assert.equal((await callback({TradeAmt:'559'})).status,409);
assert.equal((await callback({CustomField1:'OGS-P-000000000000'})).status,409);
assert.equal((await callback({},env,true)).status,400);
assert.equal((await callback({PaymentType:'ATM_TAISHIN'})).status,400);
assert.equal((await callback({SimulatePaid:'2'})).status,400);
assert.equal(await (await callback({SimulatePaid:'1'})).text(),'1|OK');
assert.equal(await (await callback({RtnCode:'0'})).text(),'1|OK');
assert.equal((await status()).paid,false);
// Pausing new checkout must not drop an already-created order's verified notification.
assert.equal(await (await callback({},{...env,OGS_ECPAY_PAYMENT_ENABLED:'false'})).text(),'1|OK');
assert.equal((await status()).paid,true);
assert.equal(await (await callback()).text(),'1|OK');
assert.equal((await callback({TradeNo:'20261123000002'})).status,409);
assert.equal((await (await request('checkout',payload)).json()).receipt,base+'/order-receipt.html?id='+orderId+'&token='+payload.requestId);
assert.equal((await request('status?id='+orderId+'&token='+randomUUID())).status,404);
const saved=await DB.prepare('SELECT snapshot,payment_reference FROM store_orders WHERE id=?').bind(orderId).first();
assert.equal(JSON.parse(saved.snapshot).delivery.address.unit,'3樓之2');
assert.equal(saved.payment_reference,'20261123000001');
assert.equal((await DB.prepare('SELECT COUNT(*) AS n FROM store_orders').first()).n,1);
console.log('PASS: official checksum; explicit enable gate; server pricing; idempotent order; signed callbacks; replay/conflict rejection; paused-checkout notifications; receipt access; preserved floor/unit. No real ECPay transaction or production database used.');
} finally {await mf.dispose();}
