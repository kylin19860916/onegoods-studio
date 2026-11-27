let products=[];
let storePayment = { enabled: false };
async function paymentConfig() {
 if (!qs('#full-product') && !qs('#store-checkout') && !qs('[data-shipping]')) return storePayment;
 try {
   const testRequested = new URLSearchParams(location.search).get('shipping-test')==='1';
   const response = await fetch(testRequested?'/api/checkout-preview/config':'/api/store-payment/config', { cache: 'no-store' });
   if (response.ok) return await response.json();
   if(testRequested) return {enabled:false,testRequested:true};
 } catch {}
 return { enabled: false };
}
const qs=s=>document.querySelector(s);
const escapeHtml=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const locale=document.documentElement.lang;
const optionalText=v=>typeof v==='string'?v.trim():'';
const validSpecs=rows=>(Array.isArray(rows)?rows:[]).filter(s=>optionalText(s?.label)&&optionalText(s?.value));
const localize=p=>{const t=p.translations?.[locale]||{};const field=k=>optionalText(t[k])||optionalText(p[k]);return {...p,name:field('name'),desc:field('description'),detail:field('detail'),en:field('tagline'),specs:validSpecs(t.specs).length?validSpecs(t.specs):validSpecs(p.specs),license:field('license'),printingNotes:field('printingNotes'),type:p.category,format:p.kind==='design'?'数字文件':'打印成品',image:p.images?.[0]?.url};};
function assetUrl(path){if(path.startsWith('/media/')||path.startsWith('https://'))return path;return (/\/(en|zh-cn)\//.test(location.pathname)?'../':'')+(path.startsWith('assets/')?path:'assets/'+path);}
function priceLabel(p){return p.price!==null&&p.price!==undefined&&!(typeof p.price==='string'&&!p.price.trim())&&Number.isFinite(Number(p.price))?'NT$'+Number(p.price).toLocaleString():'';}
function art(p){if(p.image)return `<img class="real-product-image" src="${escapeHtml(assetUrl(p.image))}" alt="${escapeHtml(p.images?.[0]?.alt||p.name)}" loading="lazy" decoding="async">`;return '<span class="photo-slot" aria-hidden="true"></span>';}
let filter='all';
let categories=[];
function renderCategoryFilters(){if(qs('.r2-listing'))return;const group=qs('.shop-tools .filters');if(!group||document.body.dataset.catalog==='digital')return;group.innerHTML='<button data-filter="all" class="active" aria-pressed="true">全部好物</button>'+categories.filter(c=>products.some(p=>p.kind==='physical'&&!p.isPlaceholder&&p.type===c.id)).map(c=>`<button data-filter="${escapeHtml(c.id)}" aria-pressed="false">${escapeHtml(locale==='en'?(c.nameEn||c.name):locale==='zh-Hans'?(c.nameZhHans||c.name):c.name)}</button>`).join('');if(filter!=='all'&&!categories.some(c=>c.id===filter))filter='all';setFilter(filter);}

function canOrder(p){
 return p?.kind==='physical'&&!p.isPlaceholder&&p.saleStatus==='available'&&Number.isSafeInteger(Number(p.price))&&Number(p.price)>0;
}
function buyAction(p){
 const official=canOrder(p)?`<div class="store-order-entry"><a class="button yellow" href="checkout.html?product=${encodeURIComponent(p.id)}">官网下单</a></div>`:'';
 if(p.saleStatus!=='available')return '<span class="sale-status">尚未开售</span>';
 const channels=[p.purchaseUrl?{id:'myship',url:p.purchaseUrl,logo:'platforms/seven-eleven.svg',label:'前往賣貨便賣场',note:'需登入 uniopen 会员'}:null,p.shopeeUrl?{id:'shopee',url:p.shopeeUrl,logo:'platforms/shopee.png',label:'蝦皮购买',note:'前往 Shopee 商品页'}:null].filter(Boolean);
 if(!channels.length)return official;
 return `<div class="purchase-platforms" role="group" aria-label="其他购买平台"><div class="purchase-platforms-heading"><p class="purchase-platforms-title">其他购买平台</p><p class="purchase-platforms-note">订单、付款与配送由各平台处理。</p></div><div class="purchase-platforms-grid">${channels.map(c=>`<a class="platform-purchase ${c.id}" href="${escapeHtml(c.url)}" target="_blank" rel="noopener noreferrer"><span class="platform-logo"><img src="${assetUrl(c.logo)}" alt="" width="96" height="48"></span><span class="platform-copy"><strong>${c.label}</strong><span>${c.note}</span></span></a>`).join('')}</div></div>`+official;
}
const studioSources = {
  "keynade-mx": "assets/keynade/01-front-retouched-v2.jpg",
  "cai-shi-yun": "/media/33a9e528-53c9-4091-9c03-0e2264915a2c",
  "enerkey-magnetic-keychain": "/media/2e1e80aa-ddac-4b22-bb49-871879854497",
  "lucky-stir-stick": "/media/a4473e71-8e1f-4981-a0d9-467fb71662d9"
};
function studioPhoto(productId, source) {
  if (!source || studioSources[productId] !== source) return null;
  const path='/assets/r2-studio/'+productId;
  return { url:path+'-800.webp', srcset:path+'-800.webp 800w, '+path+'-1600.webp 1600w' };
}
function studioImage(photo, alt, extra) {
  return `<img src="${photo.url}" srcset="${photo.srcset}" alt="${alt}" width="800" height="800" ${extra}>`;
}
function productCard(product) {
  const photo=studioPhoto(product.id,product.image);
  const image=photo ? studioImage(photo,escapeHtml(product.name)+' 商品实拍','sizes="(max-width:767px) 50vw, 300px" loading="lazy" decoding="async"') : product.image ? art(product) : '';
  return `<a class="r2-product-card" href="product.html?id=${encodeURIComponent(product.id)}">
    <div class="r2-product-art">${image}</div><h3>${escapeHtml(product.name)}</h3>
    <p>${escapeHtml(product.desc)}</p>${priceLabel(product)?`<strong>${priceLabel(product)}</strong>`:''}</a>`;
}
const customCardItems = window.OGSCustomTypes || [];
const customLocaleIndex=locale==='en'?2:locale==='zh-Hans'?1:0;
function customImage(item, lazy=true) {
  const small=assetUrl(item.image);
  const large=small.replace('-1024.webp','.webp');
  return `<img src="${small}" srcset="${small} 1024w, ${large} 2048w" sizes="(max-width:767px) 100vw, 420px" alt="${item.text[customLocaleIndex]}" width="1024" height="1024" ${lazy?'loading="lazy"':''} decoding="async">`;
}
function customStartingPrice(item) {
  return item.startingPrice ? `<span class="r2-dispatch">NT$${item.startingPrice}${locale==='en'?'+':' 起'}</span>` : '';
}
function customCatalogCard(item) {
  return `<a class="r2-product-card" href="custom?type=${item.id}">
    <div class="r2-product-art">${customImage(item)}</div>
    <h3>${item.text[customLocaleIndex]}</h3><div><span class="r2-dispatch">3 天内出货</span>${customStartingPrice(item)}</div><span class="btn-secondary">开始客制</span></a>`;
}
const customCards=qs('[data-custom-cards]');
if(customCards)customCards.innerHTML=customCardItems.map(item=>`<article>
  ${customImage(item)}
  <div><h3>${item.text[customLocaleIndex]}</h3><p>${item.description[customLocaleIndex]}</p>
  <p><span class="r2-dispatch">3 天内出货</span> ${customStartingPrice(item)}</p><a href="custom?type=${item.id}" class="btn-secondary" data-custom-link>${item.action[customLocaleIndex]}</a></div></article>`).join('');
function renderProducts(){
 const grid=qs('#products');
 if(!grid)return;
 if(document.body.dataset.catalog==='digital')return;
 let list=products.filter(p=>!p.isPlaceholder&&p.kind==='physical'&&(filter==='all'||p.type===filter));
 const sort=qs('#product-sort');
 const count=qs('#product-count');
 if(sort?.value==='price') list.sort((a,b)=>(priceLabel(a)?Number(a.price):Infinity)-(priceLabel(b)?Number(b.price):Infinity));
 if(document.body.dataset.page==='home')list=list.slice(0,4);
 if(count)count.value=count.dataset.format.replace('{count}',String(filter==='custom'?customCardItems.length:list.length));
 grid.classList.add('r2-product-grid');
 grid.innerHTML=filter==='custom'?customCardItems.map(customCatalogCard).join('')+'<p class="r2-image-note r2-grid-note">商品图为 3D 预览渲染</p>':
   list.length?list.map(productCard).join(''):'<p class="catalog-note">目前没有符合条件的商品。</p>';
}
qs('#product-sort')?.addEventListener('change',renderProducts);
function setFilter(value){filter=value;document.querySelectorAll('[data-filter]').forEach(b=>{const active=b.dataset.filter===value;b.classList.toggle('active',active);b.setAttribute('aria-pressed',active)});renderProducts();}
function paragraphs(s){return String(s||'').split('\n').map(s=>s.trim()).filter(Boolean).map(s=>`<p>${escapeHtml(s)}</p>`).join('');}
function detail(id){
  if(products.some(p=>p.id===id && p.kind==='physical')){
    location.href='product.html?id='+encodeURIComponent(id);
  }
}
let galleryPhotos=[];
function renderFullProduct(){
 const target=qs('#full-product');
 if(!target)return;
 const id=new URLSearchParams(location.search).get('id');
 const product=products.find(p=>p.id===(id==='good-key'?'keynade-mx':id)&&p.kind==='physical');
 if(!product){target.innerHTML='<h1>没有找到这件商品。</h1><a class="btn-secondary" href="products.html">浏览实体产品</a>';return;}
 const name=escapeHtml(product.name);
 document.title=product.name+' — One Goods Studio';
 const meta=document.querySelector('meta[name="description"]');
 if(meta)meta.content=product.desc||product.name;
 galleryPhotos=product.images||[];
 const photo=galleryPhotos[0];
 const cover=photo&&studioPhoto(product.id,photo.url);
 const stepIcon=plus=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path d="M5 12h14 ${plus?'M12 5v14':''}"/></svg>`;
 const gallery=photo?`<figure>${cover ? studioImage(cover,name+' 商品实拍','id="keynade-main-photo" sizes="(max-width:767px) 100vw, 630px"') : `<img id="keynade-main-photo" src="${escapeHtml(assetUrl(photo.url))}" alt="${name} 商品实拍">`}</figure>
   <div class="gallery-thumbs" role="group" aria-label="商品实拍视角">${galleryPhotos.map((im,i)=>`<button type="button" data-gallery-index="${i}" aria-label="${name} 商品视角 ${i+1}" aria-pressed="${i===0}"><img src="${escapeHtml(assetUrl(im.url))}" alt="" loading="lazy"></button>`).join('')}</div>`:
   `<div class="r2-product-art">${art(product)}</div>`;
 const purchase=buyAction(product);
 const platformLinks=purchase.replace(/<div class="store-order-entry">[\s\S]*?<\/div>/,'');
 const checkout=`checkout.html?product=${encodeURIComponent(product.id)}`;
 const buying=canOrder(product)?`<div class="r2-buy-row"><div class="r2-quantity">
   <button type="button" data-quantity="-1" aria-label="减少数量">${stepIcon(false)}</button>
   <input id="r2-quantity" type="number" min="1" max="10" value="1" aria-label="数量">
   <button type="button" data-quantity="1" aria-label="增加数量">${stepIcon(true)}</button></div>
   <a class="btn-primary" id="r2-official-order" href="${checkout}&amp;qty=1">官网下单</a></div>`:'';
 const mobileBuy=canOrder(product) ? `<div class="r2-mobile-buy" hidden><strong>${priceLabel(product)}</strong><a class="btn-primary" href="${checkout}&amp;qty=1">官网下单</a></div>` : '';
 const facts=product.keynadeFacts?'<div class="keynade-facts"><span><b>12</b>独立按键</span><span><b>MX</b>机械键轴结构</span><span><b>1</b>金属珠链随附</span></div>':'';
 const detail=product.keynadeFacts?'<p>几何外壳上的 12 个大面板，都是可独立按压的机械按键。顶部插销可以拔出、插回，是造型与把玩的装饰细节。</p><p>3D 打印的层纹与金色闪点，保留在真实物件的表面。按压声音与手感依搭配的轴体而定。</p>':'';
 const notes=product.keynadeFacts?'<p>顶部插销为装饰零件；小面板为固定造型件，12 个大面板可按压。实拍中的场景物件不属于商品内容。</p>':'';
 const specs=product.specs.length?`<dl>${product.specs.map(s=>`<div><dt>${escapeHtml(s.label)}</dt><dd>${escapeHtml(s.value)}</dd></div>`).join('')}</dl>`:'';
 const other=products.filter(p=>p.kind==='physical'&&!p.isPlaceholder&&p.id!==product.id).slice(0,3);
 target.innerHTML=`<nav class="r2-breadcrumb" aria-label="面包屑"><a href="products.html">好物</a><span aria-hidden="true">/</span><span>${name}</span></nav>
   <div class="keynade-intro r2-product-layout"><div class="keynade-gallery">${gallery}${photo?'<p class="r2-photo-caption">商品照片為實拍，背景經統一處理。</p>':''}</div>
   <div class="keynade-summary"><h1>${name}</h1>${product.keynadeFacts?'<p class="keynade-subtitle">12 键机械按压手雷</p>':''}
   ${priceLabel(product)?`<p class="keynade-price">${priceLabel(product)}</p>`:''}
   ${paragraphs(product.detail||product.desc)}${facts}${buying}
   <div class="r2-product-shipping"><p>7-ELEVEN 超商取货 <span data-shipping="pickup"></span> · 黑猫宅配 <span data-shipping="home"></span></p><p>收到商品 7 天内可申请退货 <a href="purchase-policy.html">售后说明</a></p></div>
   ${platformLinks}
   <div class="r2-product-details">
     <details><summary>商品介绍</summary>${detail||paragraphs(product.desc)}${notes}</details>
     ${specs||product.included?`<details><summary>规格与随附内容</summary>${specs}${paragraphs(product.included)}</details>`:''}
     <details><summary>配送与退换</summary><p>平台订单的配送方式与运费，请在蝦皮或賣貨便结账时确认。</p><a class="btn-text" href="purchase-policy.html">購買與售後說明</a></details>
   </div></div></div>
   <section class="r2-product-custom"><div><h2>也想要一个有你名字的？</h2>
   <label for="r2-product-name">先输入名字</label><input id="r2-product-name" data-custom-name autocomplete="off">
   <a class="btn-secondary" href="custom.html" data-custom-link>开始客制</a></div>
   <figure><img src="${assetUrl('custom/render/press_front34-1024.webp')}" alt="客制按压款" loading="lazy"><figcaption>商品图为 3D 预览渲染</figcaption></figure></section>
   ${other.length?`<section class="r2-block r2-related"><div class="r2-section-head"><h2>其他好物</h2><a href="products.html" class="btn-text">看全部好物</a></div><div class="r2-product-grid">${other.map(productCard).join('')}</div></section>`:''}`;
 target.insertAdjacentHTML('beforeend', mobileBuy);
 renderShippingFees();
 const quantity=qs('#r2-quantity');
 const order=qs('#r2-official-order');
 if(quantity&&order){
   const clamp=value=>Number.isFinite(value)?Math.max(1,Math.min(10,Math.trunc(value))):1;
   const mobile=qs('.r2-mobile-buy');
   const mobileOrder=mobile.querySelector('a');
   const sync=value=>{
     quantity.value=String(clamp(value));
     const href=checkout+'&qty='+quantity.value;
     order.setAttribute('href',href);
     mobileOrder.setAttribute('href',href);
   };
   document.body.classList.add('r2-has-mobile-buy');
   if ('IntersectionObserver' in window) {
     const watcher=new IntersectionObserver(([entry])=>{mobile.hidden=entry.isIntersecting;});
     watcher.observe(order.closest('.r2-buy-row'));
   } else mobile.hidden=false;
   quantity.addEventListener('change',()=>sync(quantity.valueAsNumber));
   order.addEventListener('click',()=>sync(quantity.valueAsNumber));
   mobileOrder.addEventListener('click',()=>sync(quantity.valueAsNumber));
   target.querySelectorAll('[data-quantity]').forEach(button=>button.addEventListener('click',()=>sync((quantity.valueAsNumber||1)+Number(button.dataset.quantity))));
 }
}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.hasAttribute('data-open-policy'))qs('#info-dialog')?.showModal();if(b.dataset.filter)setFilter(b.dataset.filter);if(b.dataset.detail)detail(b.dataset.detail);if(b.hasAttribute('data-close'))b.closest('dialog').close();if(b.dataset.galleryIndex!==undefined){const i=Number(b.dataset.galleryIndex),p=galleryPhotos[i];if(!p)return;const main=qs('#keynade-main-photo');const cover=i===0?studioPhoto(new URLSearchParams(location.search).get('id'),p.url):null;main.src=cover?.url||assetUrl(p.url);main.srcset=cover?.srcset||'';qs('#keynade-main-photo').alt=document.title.split(' — ')[0];document.querySelectorAll('[data-gallery-index]').forEach(x=>x.setAttribute('aria-pressed',x===b));}});
if(qs('#open-info'))qs('#open-info').onclick=()=>qs('#info-dialog').showModal();
document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
if(qs('#year'))qs('#year').textContent=new Date().getFullYear();
const pages={home:'index.html',products:'products.html',designs:'design-files.html',about:'about.html',product:'products.html'};document.querySelectorAll('header nav:not(.language-switch) a,.catalog-nav a').forEach(a=>{if(a.getAttribute('href')===pages[document.body.dataset.page])a.setAttribute('aria-current','page');});
async function loadCatalog(){try{const [r,payment]=await Promise.all([fetch('/api/catalog',{cache:'no-store'}),paymentConfig()]);storePayment=payment;renderShippingFees();if(!r.ok)throw Error('catalog');const data=await r.json();categories=data.categories||[];products=data.items.map(localize);renderCategoryFilters();renderProducts();renderFullProduct();renderStoreCheckout();}catch{const target=qs('#products')||qs('#full-product')||qs('#store-checkout');if(target)target.innerHTML='<p role="alert">商品资料暂时无法载入，请稍后重新整理页面。</p>';}}
function renderShippingFees(){
  document.querySelectorAll('[data-shipping]').forEach(node=>{
    const fee=node.dataset.shipping==='pickup'?storePayment.pickupShipping:storePayment.shipping;
    node.textContent=Number.isSafeInteger(fee)?'NT$'+fee:'';
  });
}
document.addEventListener('click',event=>{
  const link=event.target.closest('[data-custom-link]');
  const field=link?.closest('section')?.querySelector('[data-custom-name]');
  if(!field)return;
  const url=new URL(link.href);
  const name=field.value.trim();
  if(name)url.searchParams.set('name',name);
  else url.searchParams.delete('name');
  link.href=url.href;
});
function renderStoreCheckout(){
 const checkout=qs('#store-checkout');
 if(!checkout)return;
 const checkoutUrl=new URL(location.href);
 const test=storePayment.test === true;
 const livePickup=storePayment.enabled && !test && storePayment.pickupEnabled === true;
 if(storePayment.testRequested){checkout.innerHTML='<p role="alert">此入口仅供 OGS 管理员测试，请先登入。</p><a class="button cream" href="/signin-with-chatgpt?return_to='+encodeURIComponent(location.pathname+location.search)+'">登入管理帐号</a>';return;}
 let mapToken=checkoutUrl.searchParams.get('store');
 const draftKey='ogs-pickup-stage-test';
 let draft;
 try {
   const saved=JSON.parse(sessionStorage.getItem(draftKey));
   if(mapToken && saved?.token===mapToken) draft=saved;
 } catch {}
 const id=checkoutUrl.searchParams.get('product') || draft?.product;
 let custom;
 if(checkoutUrl.searchParams.get('custom')==='connected-name-clicker'&&!test&&storePayment.customClickerEnabled){
   try {
     const candidate=JSON.parse(sessionStorage.getItem('ogs-connected-checkout')||'null');
     if(candidate?.kind==='custom'&&candidate.design&&Number.isSafeInteger(candidate.price)&&candidate.price>0)custom=candidate;
   } catch {}
 }
 const customNames={en:'Connected name clicker','zh-Hans':'连字按压款','zh-Hant':'連字按壓款'};
 const product=custom?{id:'connected-name-clicker',name:customNames[locale]||customNames['zh-Hant'],price:custom.price}:products.find(p=>p.id===id);
 if(!custom&&!canOrder(product)){
   checkout.innerHTML='<p role="status">这件商品目前无法在官网下单。</p><a class="button cream" href="products.html">返回好物</a>';
   return;
 }
 const price=Number(product.price);
 const form=qs('#store-order-form');
 const quantity=qs('#store-quantity');
 const initialQuantity=checkoutUrl.searchParams.get('qty')||'';
 if(!custom&&!test&&/^(?:[1-9]|10)$/.test(initialQuantity))quantity.value=initialQuantity;
 const delivery=qs('#store-delivery');
 const pickupCarrier='UNIMARTC2C';
 const store=qs('#store-pickup-fields');
 const directory=qs('#store-branch-directory');
 const query=qs('#store-branch-query');
 const chooseBranch=qs('#store-choose-branch');
 directory.hidden=!livePickup;
 chooseBranch.hidden=!test;
 const branchResult=qs('#store-branch-result');
 const branchError=qs('#store-branch-error');
 const mapApi='/api/checkout-delivery-preview/';
 let selectedBranch;
 let selectingBranch=false;
 const confirmation=qs('#store-confirmation');
 const sections=[qs('#store-bag'),qs('#store-shipping'),confirmation];
 const address = qs('#store-address-fields');
 window.OGSTaiwanAddress.setup(form);
 window.OGSAddressSearch.setup(form);
 const pay = qs('#store-pay');
 const error = qs('#store-payment-error');
 const reviewAddress = qs('#store-review-address');
 const toReview = qs('#store-to-review');
 let submission;
 if (storePayment.enabled) {
   qs('#store-preview-note').hidden = true;
   if(test) {
     delivery.value='pickup';
     qs('#store-preview-note').hidden=false;qs('#store-preview-note').textContent=checkoutUrl.searchParams.get('map')==='live'?'正式门市地图仅供选店验证；完整测试请使用固定测试门市。':'内部测试 · 使用绿界固定测试门市，不会实际扣款或寄件。';
   }
   delivery.querySelector('[value=home]').textContent = '黑猫宅配 · NT$' + storePayment.shipping;
   address.hidden = address.disabled = false;
   pay.textContent = test?'前往绿界测试付款':'前往绿界付款';
 }
 if (!test) delivery.value='home';
 if (!livePickup && !test) delivery.querySelector('[value=pickup]').remove();
 else {
   delivery.querySelector('[value=pickup]').textContent='7-ELEVEN 超商取货 · NT$'+storePayment.pickupShipping;
 }
 if(!storePayment.enabled)pay.textContent='查看购买方式';
 const shippingFee=()=>delivery.value==='pickup'?storePayment.pickupShipping:(storePayment.shipping??100);
 const money=amount=>'NT$'+amount.toLocaleString('en-TW');

 qs('#store-back').href=custom?'custom?type=press&custom-order=1':'product.html?id='+encodeURIComponent(product.id);
 if(custom){
   quantity.readOnly=true;
   const item=qs('#store-custom-design');
   item.textContent=[custom.design.text,custom.fontName,...(Array.isArray(custom.paletteNames)?custom.paletteNames:[])].filter(Boolean).join(' · ');
   item.hidden=false;
 }
 const itemDetails=()=>({productId:product.id,quantity:quantity.valueAsNumber,...(custom?{kind:'custom',design:custom.design}:{})});
 qs('#store-name').textContent=product.name;
 qs('#store-unit-price').textContent=money(price);
 if(product.image){
   const image=qs('#store-photo');
   image.src=assetUrl(product.image);
   image.hidden=false;
 }
 function refresh(){
   const subtotal=price*Number(quantity.value);
   const isPickup=delivery.value==='pickup';
   const fee=shippingFee();
   if(storePayment.enabled){
     const home=qs('#store-home-fields');home.hidden=isPickup;
     home.querySelectorAll('input,select').forEach(field=>{field.disabled=isPickup || (field.name==='district'&&!form.elements.city.value);});
   }
   store.hidden=!isPickup;
   const branch=isPickup ? selectedBranch : null;
   branchResult.hidden=!branch;
   if(test)chooseBranch.textContent=branch?'更换取货门市':'选择取货门市';
   const branchLabel=branch ? branch.name+'（'+branch.id+'）' : '';
   qs('#store-branch-name').textContent=branchLabel;
   qs('#store-branch-address').textContent=branch?.address || '';
   if(!storePayment.enabled){
     reviewAddress.hidden=!branch;
     reviewAddress.textContent=branch?.address || '';
   }
   qs('#store-subtotal').textContent=money(subtotal);
   qs('#store-fee').textContent=money(fee);
   qs('#store-total').textContent=money(subtotal+fee);
   qs('#store-review-item').textContent=product.name+' × '+quantity.value+(custom?' · '+qs('#store-custom-design').textContent:'');
   qs('#store-review-shipping').textContent=isPickup?delivery.selectedOptions[0].text.split(' · ')[0]+(branch?' · '+branchLabel:''):delivery.selectedOptions[0].text.split(' · ')[0];
 }
 function showStep(step){
   sections.forEach((section,index)=>{section.hidden=index!==step;});
   sections[step].querySelector('h2').focus();
 }
 function showBranchError(message){
   branchError.textContent=message;
   branchError.hidden=false;
 }
 delivery.addEventListener('change',()=>{ branchError.hidden=true; });
 if (livePickup) {
   const search=qs('#store-branch-search');
   const searchStatus=qs('#store-branch-search-status');
   const results=qs('#store-branch-options');
   search.addEventListener('click',async()=>{
     const term=query.value.trim();
     results.replaceChildren();
     results.hidden=true;
     if(term.length<2){searchStatus.textContent='请输入至少两个字。';return;}
     search.disabled=true;
     searchStatus.textContent='正在搜寻门市…';
     try {
       const response=await fetch(mapApi+'public-branches?q='+encodeURIComponent(term),{cache:'no-store'});
       if(!response.ok)throw new Error();
       const {branches}=await response.json();
       if(query.value.trim()!==term){searchStatus.textContent='';return;}
       searchStatus.textContent=branches.length?'请选择取货门市。':'找不到门市，请换个关键字。';
       for(const branch of branches){
         const item=document.createElement('li');
         const button=document.createElement('button');
         button.type='button';
         button.className='button cream';
         button.textContent=branch.name+'（'+branch.id+'） · '+branch.address;
         button.addEventListener('click',async()=>{
           selectingBranch=true;
           search.disabled=true;
           results.querySelectorAll('button').forEach(button=>button.disabled=true);
           try {
             const response=await fetch(mapApi+'public-store-start',{method:'POST',headers:{'Content-Type':'application/json'},
               body:JSON.stringify({carrier:pickupCarrier,branchId:branch.id})});
             const selection=await response.json();
             if(!response.ok || !selection.branch || !selection.token)throw new Error();
             if(delivery.value!=='pickup' || sections[1].hidden)return;
             mapToken=selection.token;
             selectedBranch=selection.branch;
             query.value=selectedBranch.name;
             results.replaceChildren();
             results.hidden=true;
             searchStatus.textContent='';
             branchError.hidden=true;
             refresh();
             query.focus();
           } catch { searchStatus.textContent='暂时无法选择这个门市，请重试。'; }
           finally {
             selectingBranch=false;
             search.disabled=false;
             results.querySelectorAll('button').forEach(button=>button.disabled=false);
           }
         });
         item.append(button);
         results.append(item);
       }
       results.hidden=!branches.length;
     } catch { searchStatus.textContent='暂时无法搜寻门市，请重试。'; }
     finally { search.disabled=false; }
   });
   query.addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();search.click();}});
 }
 if(test) chooseBranch.addEventListener('click',async()=>{
   if(!quantity.reportValidity())return;
   chooseBranch.disabled=true;
   branchError.hidden=true;
   try {
     const response=await fetch(mapApi+'store-start',{
       method:'POST',headers:{'Content-Type':'application/json'},
       body:JSON.stringify({carrier:pickupCarrier,mobile:matchMedia('(max-width: 680px)').matches,language:document.documentElement.lang,flow:'storefront-test',map:checkoutUrl.searchParams.get('map')}),
     });
     const selection=await response.json();
     if(!response.ok || !['https://logistics.ecpay.com.tw/Express/map','https://logistics-stage.ecpay.com.tw/Express/map'].includes(selection.action))throw new Error();
     if(delivery.value!=='pickup' || sections[1].hidden)return;
     sessionStorage.setItem(draftKey,JSON.stringify({
       token:selection.token,product:product.id,quantity:quantity.value,carrier:pickupCarrier,
       contact:form.elements.contact.value,phone:form.elements.phone.value,email:form.elements.email.value,
     }));
     const mapForm=document.createElement('form');
     mapForm.method='POST';
     mapForm.action=selection.action;
     for(const [name,value] of Object.entries(selection.fields)){
       const field=document.createElement('input');
       Object.assign(field,{type:'hidden',name,value});
       mapForm.append(field);
     }
     document.body.append(mapForm);
     mapForm.submit();
   } catch {
     showBranchError('暂时无法打开取货门市，请重试。');
   } finally {
     chooseBranch.disabled=false;
   }
 });
 async function restoreBranch(){
   if(!test || draft?.product!==product.id || draft.carrier!==pickupCarrier)return;
   checkoutUrl.searchParams.set('product',product.id);
   history.replaceState(null,'',checkoutUrl);
   delivery.value='pickup';
   quantity.value=draft.quantity;
   if(test) for(const name of ['contact','phone','email'])form.elements[name].value=draft[name]||'';
   refresh();
   showStep(1);
   chooseBranch.disabled=true;
   try {
     const response=await fetch(mapApi+'public-store?token='+encodeURIComponent(mapToken),{cache:'no-store'});
     const {store:branch}=await response.json();
     if(!response.ok || !branch)throw new Error();
     selectedBranch={...branch,carrier:draft.carrier};
     refresh();
   } catch {
     showBranchError('请重新选择取货门市。');
   } finally {
     chooseBranch.disabled=false;
   }
 }
 quantity.addEventListener('input',refresh);
 form.addEventListener('change',refresh);
 qs('#store-to-shipping').addEventListener('click',()=>{
   if(quantity.reportValidity())showStep(1);
 });
 qs('#store-to-bag').addEventListener('click',()=>showStep(0));
 qs('#store-edit-shipping').addEventListener('click',()=>showStep(1));
 form.addEventListener('submit', async event => {
   event.preventDefault();
   refresh();
   if (!sections[1].hidden) {
     if(delivery.value==='pickup' && selectingBranch)return;
     if(delivery.value==='pickup' && !selectedBranch){
       showBranchError('请先选择取货门市。');
       (test?chooseBranch:query).focus();
       return;
     }
     if (storePayment.enabled) {
       const fields = form.elements;
       reviewAddress.textContent = [fields.contact.value, fields.phone.value, fields.email.value,
         delivery.value==='pickup'?qs('#store-branch-address').textContent:fields.postalCode.value + ' ' + fields.city.value + fields.district.value + fields.street.value + fields.unit.value].join(' · ');
       reviewAddress.hidden = false;
     }
     if (storePayment.enabled && !test) {
       const method=delivery.value;
       const count=quantity.valueAsNumber;
       const storeToken=method==='pickup'?mapToken:null;
       const expectedTotal=price*count+shippingFee();
       toReview.disabled=true;
       branchError.hidden=true;
       try {
         const response=await fetch('/api/store-payment/quote',{
           method:'POST',headers:{'Content-Type':'application/json'},
           body:JSON.stringify({...itemDetails(),method,storeToken}),
         });
         const quote=await response.json();
         if(!response.ok)throw new Error(quote.error||'暂时无法核对运费，请重试。');
         if(sections[1].hidden || delivery.value!==method || quantity.valueAsNumber!==count || (method==='pickup' && (selectingBranch || storeToken!==mapToken)))return;
         if(quote.amount!==expectedTotal || quote.shipping!==shippingFee())throw new Error('商品或运费已变更，请重新整理后确认。');
       } catch (failure) {
         showBranchError(failure.message);
         return;
       } finally { toReview.disabled=false; }
     }
     showStep(2);
     return;
   }
   if (confirmation.hidden) return;
   if (!storePayment.enabled) {
     error.textContent='线上刷卡付款开通中，目前可透过蝦皮或賣貨便购买。';
     error.hidden=false;
     const channels = document.createElement('div');
     channels.innerHTML=buyAction(product).replace(/<div class="store-order-entry">[\s\S]*?<\/div>/, '');
     error.replaceChildren(document.createTextNode(error.textContent),channels);
     return;
   }
   const payload = { ...Object.fromEntries(new FormData(form)), ...itemDetails(),method:delivery.value,storeToken:delivery.value==='pickup'?mapToken:null,
     total: price * quantity.valueAsNumber + shippingFee() };
   const snapshot = JSON.stringify(payload);
   if (submission?.snapshot !== snapshot) submission = { snapshot, requestId: crypto.randomUUID() };
   pay.disabled = true;
   error.hidden = true;
   try {
     const testPayload={requestId:submission.requestId,provider:'ecpay',flow:'storefront-test',total:payload.total,item:{kind:'physical',id:product.id,quantity:quantity.valueAsNumber},method:delivery.value==='pickup'?'store':'home',storeToken:payload.storeToken,contact:payload.contact,phone:payload.phone,address:{city:payload.city,district:payload.district,postalCode:payload.postalCode,street:payload.street,unit:payload.unit}};
     const response = await fetch(test?'/api/checkout-preview':'/api/store-payment/checkout', {
       method: 'POST', headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(test?testPayload:{ ...payload, requestId: submission.requestId }),
     });
     const result = await response.json();
     if (!response.ok) throw new Error(result.error || '目前无法前往付款。');
     if(test){if(!/^\/api\/checkout-preview\/payment\/OGS-DEMO-[A-F0-9]{12}$/.test(result.checkoutUrl||''))throw new Error('目前无法前往付款。');location.assign(result.checkoutUrl);return;}
     if (result.receipt) {
       location.assign(result.receipt);
       return;
     }
     if (result.action !== 'https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5') throw new Error('目前无法前往付款。');
     const paymentForm = document.createElement('form');
     paymentForm.method = 'POST';
     paymentForm.action = result.action;
     for (const [name, value] of Object.entries(result.fields)) {
       const field = document.createElement('input');
       Object.assign(field, { type: 'hidden', name, value });
       paymentForm.append(field);
     }
     document.body.append(paymentForm);
     paymentForm.submit();
   } catch (failure) {
     error.textContent = failure.message;
     error.hidden = false;
     pay.disabled = false;
   }
 });
 refresh();
 qs('#store-loading').hidden=true;
 form.hidden=false;
 restoreBranch();
}
loadCatalog();
