import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,readdirSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';import {pathToFileURL} from 'node:url';import {randomUUID} from 'node:crypto';import {build} from 'esbuild';import {Miniflare} from 'miniflare';
const dir=mkdtempSync(join(tmpdir(),'ogs-seven-'));
for(const name of ['checkout-preview','checkout-delivery-preview','checkout-logistics-preview','ecpay-stage','clicker-orders','store-payment','store-pickup-shipment','ecpay-logistics']) await build({entryPoints:['server/'+name+'.ts'],outfile:join(dir,name+'.mjs'),bundle:true,platform:'node',format:'esm',define:{'import.meta.env.DEV':'false'},plugins:[{name:'physical-only-test',setup(b){b.onResolve({filter:/clicker-print$/},()=>({path:'unused-custom-print',namespace:'test'}));b.onLoad({filter:/.*/,namespace:'test'},()=>({contents:"export function generateClicker3mf(){throw Error('Custom print is outside this test')} export const generateMechanical3mf=generateClicker3mf;",loader:'js'}));}}]});
const load=async n=>import(pathToFileURL(join(dir,n+'.mjs')));
const {previewCheckout,recordPhysicalStagePayment}=await load('checkout-preview');const {deliveryPreview}=await load('checkout-delivery-preview');const {logisticsPreview,logisticsStageMac}=await load('checkout-logistics-preview');const {stageCheckMac}=await load('ecpay-stage');const {clickerOrderApi}=await load('clicker-orders');
const {storePayment}=await load('store-payment');
const {storePickupShipment}=await load('store-pickup-shipment');
const {receiveLogisticsNotice,logisticsMac}=await load('ecpay-logistics');
const mf=new Miniflare({modules:true,script:'export default {fetch(){return new Response("test")}}',compatibilityDate:'2026-05-22',d1Databases:['DB'],inspectorPort:0});const originalFetch=globalThis.fetch;
try{
 const DB=await mf.getD1Database('DB');
 for(const name of readdirSync('drizzle').filter(n=>n.endsWith('.sql')).sort())for(const sql of readFileSync('drizzle/'+name,'utf8').split('--> statement-breakpoint'))if(sql.trim()) await DB.prepare(sql).run();
 await DB.prepare('INSERT INTO catalog (id,kind,status,data,updated_at) VALUES (?,?,?,?,?)').bind('keynade-mx','physical','published',JSON.stringify({name:'Keynade MX',price:499,saleStatus:'available'}),new Date().toISOString()).run();
 const admin={email:'admin@example.test'},base='https://onegoods.studio';const env={DB,BUCKET:{},OGS_ADMIN_EMAILS:admin.email,OGS_ECPAY_STAGE_RETURN_URL:base+'/api/clicker-orders/test/ecpay-return/'+'a'.repeat(32),OGS_ECPAY_LOGISTICS_MERCHANT_ID:'9876543'};
 const get=path=>new Request(base+path);const post=(path,body)=>new Request(base+path,{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify(body)});
 const checkout=(body,user=admin)=>previewCheckout(post('/api/checkout-preview',body),env,user);
 const logistics=(action,id,user=admin)=>logisticsPreview(post('/api/checkout-logistics-preview/'+action,{id}),env,user);
 assert.equal((await previewCheckout(get('/api/checkout-preview/config'),env,null)).status,403);
 assert.deepEqual(await (await previewCheckout(get('/api/checkout-preview/config'),env,admin)).json(),{enabled:true,test:true,shipping:100,pickupShipping:60});
 const mapBody={carrier:'UNIMARTC2C',flow:'storefront-test',map:'live',language:'zh-Hant'};
 assert.equal((await deliveryPreview(post('/api/checkout-delivery-preview/public-store-start',mapBody),env,null)).status,403);
 const selected=await (await deliveryPreview(post('/api/checkout-delivery-preview/store-start',mapBody),env,admin)).json();
 assert.equal(selected.action,'https://logistics.ecpay.com.tw/Express/map');assert.equal(selected.fields.MerchantID,'9876543');assert(selected.token.startsWith('vt'));assert.equal(selected.fields.IsCollection,'N');
 const fields={MerchantID:'9876543',ExtraData:selected.token,LogisticsSubType:'UNIMARTC2C',CVSStoreID:'238669',CVSStoreName:'經貿',CVSAddress:'台北市南港區經貿二路1號'};
 const returned=await deliveryPreview(new Request(base+'/api/checkout-delivery-preview/store-return',{method:'POST',body:new URLSearchParams(fields)}),env,null);
 assert.equal(returned.status,303);assert(returned.headers.get('Location').includes('shipping-test=1&map=live&store='+selected.token));
 const stageMap=await (await deliveryPreview(post('/api/checkout-delivery-preview/store-start',{...mapBody,map:'stage'}),env,admin)).json();assert.equal(stageMap.action,'https://logistics-stage.ecpay.com.tw/Express/map');assert.equal(stageMap.fields.MerchantID,'2000933');
 await DB.prepare('UPDATE checkout_preview_store_maps SET result=? WHERE token=?').bind(JSON.stringify({carrier:'7-ELEVEN',id:'238669',name:'經貿',address:'台北市南港區經貿二路1號'}),stageMap.token).run();
 const payload={requestId:randomUUID(),provider:'ecpay',flow:'storefront-test',total:559,item:{kind:'physical',id:'keynade-mx',quantity:1},method:'store',storeToken:stageMap.token,contact:'測試收件',phone:'0911111111'};
 assert.equal((await checkout(payload,null)).status,403);
 assert.equal((await checkout({...payload,storeToken:selected.token})).status,409);
 assert.equal((await checkout({...payload,total:599})).status,409);
 assert.equal((await checkout({...payload,storeToken:'invalid'})).status,400);
 const created=await checkout(payload);assert.equal(created.status,201);const receipt=await created.json();assert.equal(receipt.total,559);assert.equal(receipt.shipping,60);assert.equal(receipt.delivery.store.id,'238669');
 assert.equal((await checkout(payload)).status,200);assert.equal((await checkout({...payload,contact:'改收件'})).status,409);
 const payment=await previewCheckout(get(receipt.checkoutUrl),env,admin);const html=await payment.text();assert(html.includes('https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5'));assert(!html.includes('https://payment.ecpay.com.tw/'));assert(html.includes('name="TotalAmount" value="559"'));
 assert.equal((await logistics('create',receipt.id)).status,409);
 // Validate a signed sandbox payment against a separately signed sandbox query.
 const paid={MerchantID:'3002607',MerchantTradeNo:'OGSD'+receipt.id.slice(9),CustomField1:receipt.id,TradeAmt:'559',TradeNo:'TEST20261124001',PaymentType:'Credit_CreditCard',RtnCode:'1',SimulatePaid:'0'};
 globalThis.fetch=async(url)=>{assert.equal(new URL(url).hostname,'payment-stage.ecpay.com.tw');const response={...paid,TradeStatus:'1'};response.CheckMacValue=await stageCheckMac(response);return new Response(new URLSearchParams(response).toString());};
 assert.equal(await (await recordPhysicalStagePayment(DB,receipt.id,paid)).text(),'1|OK');
 let createCalls=0, submitted;const signed=fields=>new URLSearchParams({...fields,CheckMacValue:logisticsStageMac(fields)}).toString();let row;
 globalThis.fetch=async(url,options)=>{
  assert.equal(new URL(url).hostname,'logistics-stage.ecpay.com.tw');const body=Object.fromEntries(options.body);assert.equal(body.MerchantID,'2000933');assert.equal(body.CheckMacValue,logisticsStageMac(body));
  if(new URL(url).pathname==='/Express/Create'){createCalls++;submitted=body;return new Response('1|'+signed({MerchantID:'2000933',MerchantTradeNo:body.MerchantTradeNo,AllPayLogisticsID:'1234567890',LogisticsSubType:'UNIMARTC2C',RtnCode:'300'}));}
  return new Response(signed({MerchantID:'2000933',MerchantTradeNo:row.trade_no,AllPayLogisticsID:'1234567890',LogisticsSubType:'UNIMARTC2C',LogisticsStatus:'300',GoodsAmount:'499',CollectionAmount:'0',CVSPaymentNo:'12345678',CVSValidationNo:'1234'}));
 };
 const shipment=await logistics('create',receipt.id);assert.equal(shipment.status,200);row=await shipment.json();assert.equal(submitted.ReceiverStoreID,'238669');assert.equal(submitted.GoodsAmount,'499');assert.equal(submitted.IsCollection,'N');assert.equal(row.order_id,receipt.id);assert.equal(row.status,'300');assert.equal(row.trade_no.length,20);
 await logistics('create',receipt.id);assert.equal(createCalls,1);
 assert.deepEqual(await (await logistics('code',receipt.id)).json(),{code:'123456781234'});
 const label=await (await logistics('print',receipt.id)).json();assert.equal(label.action,'https://logistics-stage.ecpay.com.tw/Express/PrintUniMartC2COrderInfo');assert.equal(label.fields.AllPayLogisticsID,row.logistics_id);
 const notice={MerchantID:'2000933',MerchantTradeNo:row.trade_no,AllPayLogisticsID:row.logistics_id,LogisticsSubType:'UNIMARTC2C',RtnCode:'300'};
 const callback=base+'/api/checkout-logistics-preview/notice/'+'a'.repeat(32);
 assert.equal(await (await logisticsPreview(new Request(callback,{method:'POST',body:signed(notice)}),env,null)).text(),'1|OK');
 const list=await (await clickerOrderApi(get('/api/admin/clicker-orders'),env,admin)).json();const order=list.physicalItems.find(o=>o.id===receipt.id);assert.equal(order.shipment.id,row.logistics_id);assert.equal(order.delivery.store.id,'238669');assert.equal(order.amount,559);assert.equal(order.matchedReference,paid.TradeNo);
 const labelCheckPath='/api/checkout-logistics-preview/check-label?id='+receipt.id;
 assert.equal((await logisticsPreview(get(labelCheckPath),env,null)).status,403);
 const labelCheck=await logisticsPreview(get(labelCheckPath),env,admin);
 assert.equal(labelCheck.status,200);
 const verifiedLabel=await labelCheck.text();
 for(const value of [receipt.id, '238669', row.logistics_id, '123456781234', '不可交寄']) assert(verifiedLabel.includes(value));
 const pending=await logisticsPreview(post('/api/checkout-logistics-preview/export-pending',{}),env,admin);const pendingHtml=await pending.text();assert.equal(pending.status,200);assert(pendingHtml.includes(receipt.id));assert(pendingHtml.includes('238669'));assert(pendingHtml.includes('123456781234'));
 const home={...payload,requestId:randomUUID(),method:'home',total:599,address:{city:'臺北市',district:'南港區',postalCode:'115',street:'三重路19號',unit:'3樓'}};assert.equal((await (await checkout(home)).json()).total,599);
 assert.equal((await logistics('create','OGS-P-0123456789AB')).status,400);
 assert.equal((await logistics('create',receipt.id,null)).status,403);
 const audit=JSON.parse((await DB.prepare('SELECT audit_json FROM checkout_preview_shipments WHERE order_id=?').bind(receipt.id).first()).audit_json);assert.equal(audit.sent.ReceiverStoreID,'238669');assert(!JSON.stringify(audit.sent).includes('CheckMacValue'));assert.equal(audit.environment,'logistics-stage');
 assert.equal((await logistics('retry-create',receipt.id)).status,409);
 await DB.prepare('UPDATE checkout_preview_shipments SET logistics_id=NULL,audit_json=? WHERE order_id=?').bind(JSON.stringify({attemptedAt:'2026-01-01T00:00:00Z'}),receipt.id).run();
 globalThis.fetch=async(url)=>new Response(new URL(url).pathname.includes('QueryLogistics')?'0|找不到訂單':'0|測試錯誤', {status:new URL(url).pathname.includes('QueryLogistics')?500:200});
 const retried=await logistics('retry-create',receipt.id);assert.equal(retried.status,502);assert((await retried.json()).error.includes('0|測試錯誤'));
 const failedAudit=JSON.parse((await DB.prepare('SELECT audit_json FROM checkout_preview_shipments WHERE order_id=?').bind(receipt.id).first()).audit_json);assert.equal(failedAudit.providerResponse,'0|測試錯誤');
 // Exercise the public selection and payment payload without a transaction or shipment.
 const liveEnv={...env,OGS_PUBLIC_PICKUP_ENABLED:'true',OGS_ECPAY_LOGISTICS_HASH_KEY:'testlogistics123',OGS_ECPAY_LOGISTICS_HASH_IV:'testlogistics321',OGS_ECPAY_PAYMENT_ENABLED:'true',
   OGS_ECPAY_PAYMENT_MERCHANT_ID:'9876543',OGS_ECPAY_PAYMENT_HASH_KEY:'testtesttest1234',OGS_ECPAY_PAYMENT_HASH_IV:'testtesttest4321',OGS_STORE_HOME_SHIPPING_FEE:'100'};
 const pay=(path,data,session='',settings=liveEnv)=>storePayment(new Request(base+'/api/store-payment/'+path,data?{
   method:'POST',headers:{Origin:base,'Content-Type':'application/json',Cookie:session},body:JSON.stringify(data),
 }:undefined),settings);
 assert.equal((await (await pay('config')).json()).pickupEnabled,true);
 assert.equal((await (await pay('config',null,'',{...liveEnv,OGS_PUBLIC_PICKUP_ENABLED:undefined})).json()).pickupEnabled,false);
 // Read and select from the authoritative directory without calling a transaction endpoint.
 globalThis.fetch=async(url,options)=>{
   assert.equal(url,'https://logistics.ecpay.com.tw/Helper/GetStoreList');
   assert.equal(options.body.get('CvsType'),'UNIMART');
   assert.match(options.body.get('CheckMacValue'),/^[A-F0-9]{32}$/);
   return Response.json({RtnCode:1,StoreList:[{CvsType:'UNIMART',StoreInfo:[{StoreId:'294278',StoreName:'經貿',StoreAddr:'台北市南港區三重路19號1樓'},{StoreId:'249278',StoreName:'欣東勢',StoreAddr:'臺中市東勢區第一橫街153號'}]}]});
 };
 const directory=await deliveryPreview(get('/api/checkout-delivery-preview/public-branches?q='+encodeURIComponent('經貿')),liveEnv,null);
 assert.deepEqual(await directory.json(),{branches:[{id:'294278',name:'經貿',address:'台北市南港區三重路19號1樓'}]});
 for (const query of ['东势','東勢','台中市 东势区','２４９２７８']) {
   const match=await deliveryPreview(get('/api/checkout-delivery-preview/public-branches?q='+encodeURIComponent(query)),liveEnv,null);
   assert.deepEqual(await match.json(),{branches:[{id:'249278',name:'欣東勢',address:'臺中市東勢區第一橫街153號'}]});
 }
 const selectBranch=branchId=>deliveryPreview(post('/api/checkout-delivery-preview/public-store-start',{carrier:'UNIMARTC2C',branchId}),liveEnv,null);
 assert.equal((await selectBranch('999999')).status,400);
 const openMap=await selectBranch('294278');
 assert.equal(openMap.status,200);
 const liveSelection=await openMap.json();
 assert.equal(liveSelection.branch.id,'294278');
 const session=openMap.headers.get('Set-Cookie').split(';',1)[0];
 assert(liveSelection.token.startsWith('lt'));
 const quoteData={productId:'keynade-mx',quantity:1,method:'pickup',storeToken:liveSelection.token};
 assert.equal((await pay('quote',quoteData)).status,400);
 assert.equal((await pay('quote',{...quoteData,storeToken:stageMap.token},session)).status,400);
 assert.deepEqual(await (await pay('quote',quoteData,session)).json(),{name:'Keynade MX',quantity:1,subtotal:499,shipping:60,amount:559});
 assert.equal((await (await pay('quote',{...quoteData,method:'home'},session)).json()).amount,599);
 assert.equal((await DB.prepare('SELECT COUNT(*) AS n FROM store_orders').first()).n,0);
 const cart={...quoteData,requestId:randomUUID(),total:559,contact:'驗收測試',phone:'0900000000',email:'test@example.com'};
 assert.equal((await pay('checkout',{...cart,total:599},session)).status,409);
 const paymentForm=await (await pay('checkout',cart,session)).json();
 assert.equal(paymentForm.fields.TotalAmount,'559');
 assert(paymentForm.fields.ItemName.endsWith('7-ELEVEN 超商取貨'));
 const orders=await (await clickerOrderApi(get('/api/admin/clicker-orders'),liveEnv,admin)).json();
 assert.deepEqual(orders.physicalItems.find(x=>x.id===paymentForm.fields.CustomField1).delivery.store,
   {id:'294278',carrier:'7-ELEVEN',name:'經貿',address:'台北市南港區三重路19號1樓'});
 const id=paymentForm.fields.CustomField1;
 const livePath=base+'/api/admin/store-pickup-shipment/';
 const liveCfg={...liveEnv,OGS_ECPAY_LOGISTICS_RETURN_URL:base+'/api/logistics/ecpay/notify',OGS_LIVE_PICKUP_FULFILLMENT_ENABLED:'true'};
 const createBody={id,confirmed:true,senderName:'測試寄件',senderPhone:'0911111111'};
 const fulfillment=(action,data=createBody,config=liveCfg,user=admin)=>storePickupShipment(new Request(livePath+action,{
   method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify(data),
 }),config,user);
 assert.equal((await fulfillment('create',createBody,liveCfg,null)).status,403);
 assert.equal((await fulfillment('create')).status,409);
 await DB.prepare('UPDATE store_orders SET payment_reference=?,paid_at=? WHERE id=?').bind('TEST12345678',new Date().toISOString(),id).run();
 assert.equal((await fulfillment('create',createBody,{...liveCfg,OGS_LIVE_PICKUP_FULFILLMENT_ENABLED:'false'})).status,503);
 assert.equal((await fulfillment('create',createBody,{...liveCfg,OGS_LIVE_PICKUP_FULFILLMENT_ORDER_ID:'OGS-P-000000000000'})).status,503);
 assert.equal((await fulfillment('create',{...createBody,confirmed:false})).status,400);
 let liveCreateCalls=0;
 const responseFields={MerchantID:'9876543',MerchantTradeNo:'OGSPCVS'+id.slice(-12),AllPayLogisticsID:'70000012',GoodsAmount:'499',CollectionAmount:'0',LogisticsType:'CVS',LogisticsSubType:'UNIMARTC2C'};
 const signLive=fields=>{
   const params=new URLSearchParams(fields);
   params.set('CheckMacValue',logisticsMac(params,liveCfg.OGS_ECPAY_LOGISTICS_HASH_KEY,liveCfg.OGS_ECPAY_LOGISTICS_HASH_IV));
   return params;
 };
 const liveNotice=fields=>receiveLogisticsNotice(new Request(liveCfg.OGS_ECPAY_LOGISTICS_RETURN_URL,{method:'POST',body:signLive(fields)}),liveCfg);
 globalThis.fetch=async(url,options)=>{
   assert.equal(options.headers.Accept,'text/html');
   if(new URL(url).pathname==='/Express/Create') return new Response('0|您的綠界帳戶可用餘額不足');
   assert.equal(new URL(url).pathname,'/Helper/QueryLogisticsTradeInfo/V5');
   return new Response('0|找不到訂單');
 };
 const rejectedLive=await fulfillment('create');
 assert.equal(rejectedLive.status,502);
 assert.match((await rejectedLive.json()).error,/餘額或可建單額度不足/);
 assert.equal((await fulfillment('create')).status,409);
 await DB.prepare('UPDATE store_pickup_shipments SET attempted_at=? WHERE order_id=?').bind(Date.now()-46000,id).run();
 assert.equal((await (await fulfillment('query')).json()).status,'retryable');
 globalThis.fetch=async(url,options)=>{
   const uri=new URL(url);
   assert.equal(uri.origin,'https://logistics.ecpay.com.tw');
   assert.equal(options.body.get('MerchantTradeNo'),responseFields.MerchantTradeNo);
   if(uri.pathname==='/Express/Create'){
     liveCreateCalls++;
     assert.equal(options.body.get('ReceiverStoreID'),'294278');
     assert.equal(options.body.get('GoodsAmount'),'499');
     assert.equal(options.body.get('IsCollection'),'N');
     assert.equal(await (await liveNotice({...responseFields,ReceiverStoreID:'294278',RtnCode:'300'})).text(),'1|OK');
     return new Response('1|'+signLive({...responseFields,ReceiverStoreID:'294278',RtnCode:'300'}));
   }
   assert.equal(uri.pathname,'/Helper/QueryLogisticsTradeInfo/V5');
   return new Response(signLive({...responseFields,LogisticsStatus:'300',CVSPaymentNo:'D0123456',CVSValidationNo:'0123'}).toString());
 };
 const createdLive=await fulfillment('create',createBody,{
   ...liveCfg,OGS_LIVE_PICKUP_FULFILLMENT_ENABLED:'false',OGS_LIVE_PICKUP_FULFILLMENT_ORDER_ID:id,
 });
 assert.equal(createdLive.status,200,await createdLive.clone().text());
 assert.equal((await createdLive.json()).logistics_id,'70000012');
 assert.equal((await fulfillment('create')).status,409);
 assert.equal(liveCreateCalls,1);
 assert.equal((await fulfillment('create',{...createBody,id:receipt.id})).status,400);
 const livePrint=await (await fulfillment('print')).json();
 assert.equal(livePrint.action,'https://logistics.ecpay.com.tw/Express/PrintUniMartC2COrderInfo');
 assert.equal(livePrint.fields.AllPayLogisticsID,'70000012');
 assert.equal(livePrint.fields.CVSPaymentNo,'D0123456');
 assert.equal(livePrint.fields.CVSValidationNo,'0123');
 assert.equal((await liveNotice({...responseFields,AllPayLogisticsID:'1111',RtnCode:'300'})).status,409);
 const joined=(await (await clickerOrderApi(get('/api/admin/clicker-orders'),liveCfg,admin)).json()).physicalItems.find(row=>row.id===id);
 assert.equal(joined.shipment.id,'70000012');
 assert.equal(joined.shipment.notice,'300');
 const design = { text: 'Olivia', font: 'chiron-round', colors: { border: '#f2c879', fill: '#efb39e', ink: '#fffcf5' } };
 const customConfig = { ...liveCfg, ASSETS: {
   fetch: async () => new Response(readFileSync('public/assets/fonts/keyring/ChironGoRoundTC-700B.woff')),
 } };
 const customCart = { ...cart, requestId: randomUUID(), productId: 'connected-name-clicker', kind: 'custom', design, total: 390 };
 const customForm = await (await pay('checkout', customCart, session, customConfig)).json();
 assert.equal(customForm.fields.TotalAmount, '390');
 const customOrders = await (await clickerOrderApi(get('/api/admin/clicker-orders?q=Olivia'), customConfig, admin)).json();
 const customOrder = customOrders.physicalItems.find(row => row.id === customForm.fields.CustomField1);
 assert.equal(customOrder.kind, 'custom');
 assert.equal(customOrder.delivery.store.id, '294278');
 assert.deepEqual(customOrder.design, design);
 assert.equal(customOrder.matchedReference, null);
 console.log('PASS: sandbox reconciliation sheet; live paid-order store mapping, signed early notification, duplicate prevention, print request and admin isolation. Provider calls simulated.');
} finally {globalThis.fetch=originalFetch;await mf.dispose();}
