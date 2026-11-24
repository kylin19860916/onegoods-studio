let products=[];
let storePayment = { enabled: false };
async function paymentConfig() {
 if (!qs('#full-product') && !qs('#store-checkout')) return storePayment;
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
const localize=p=>{const t=p.translations?.[locale]||{};const field=k=>optionalText(t[k])||optionalText(p[k]);return {...p,name:field('name'),desc:field('description'),detail:field('detail'),en:field('tagline'),specs:validSpecs(t.specs).length?validSpecs(t.specs):validSpecs(p.specs),license:field('license'),printingNotes:field('printingNotes'),type:p.category,format:p.kind==='design'?'Digital files':'Printed object',image:p.images?.[0]?.url};};
function assetUrl(path){if(path.startsWith('/media/')||path.startsWith('https://'))return path;return (/\/(en|zh-cn)\//.test(location.pathname)?'../':'')+(path.startsWith('assets/')?path:'assets/'+path);}
function priceLabel(p){return p.price!==null&&p.price!==undefined&&!(typeof p.price==='string'&&!p.price.trim())&&Number.isFinite(Number(p.price))?'NT$'+Number(p.price).toLocaleString():'';}
function art(p){if(p.image)return `<img class="real-product-image" src="${escapeHtml(assetUrl(p.image))}" alt="${escapeHtml(p.images?.[0]?.alt||p.name)}" loading="lazy" decoding="async">`;return '<span class="photo-slot" aria-hidden="true"></span>';}
let filter='all';
let categories=[];
function renderCategoryFilters(){const group=qs('.shop-tools .filters');if(!group||document.body.dataset.catalog==='digital')return;group.innerHTML='<button data-filter="all" class="active" aria-pressed="true">All goods</button>'+categories.filter(c=>products.some(p=>p.kind==='physical'&&!p.isPlaceholder&&p.type===c.id)).map(c=>`<button data-filter="${escapeHtml(c.id)}" aria-pressed="false">${escapeHtml(locale==='en'?(c.nameEn||c.name):locale==='zh-Hans'?(c.nameZhHans||c.name):c.name)}</button>`).join('');if(filter!=='all'&&!categories.some(c=>c.id===filter))filter='all';setFilter(filter);}

function canOrder(p){
 return p?.kind==='physical'&&!p.isPlaceholder&&p.saleStatus==='available'&&Number.isSafeInteger(Number(p.price))&&Number(p.price)>0;
}
function buyAction(p){
 const official=canOrder(p)?`<div class="store-order-entry"><a class="button yellow" href="checkout.html?product=${encodeURIComponent(p.id)}">Order on OGS</a>${storePayment.enabled?'':'<small>Online card payments coming soon</small>'}</div>`:'';
 if(p.saleStatus!=='available')return '<span class="sale-status">Not yet on sale</span>';
 const channels=[p.purchaseUrl?{id:'myship',url:p.purchaseUrl,logo:'platforms/seven-eleven.svg',label:'Visit our MyShip store',note:'uniopen sign-in required'}:null,p.shopeeUrl?{id:'shopee',url:p.shopeeUrl,logo:'platforms/shopee.png',label:'Buy on Shopee',note:'View on Shopee'}:null].filter(Boolean);
 if(!channels.length)return official;
 return `<div class="purchase-platforms" role="group" aria-label="Other ways to buy"><div class="purchase-platforms-heading"><p class="purchase-platforms-title">Other ways to buy</p><p class="purchase-platforms-note">Orders, payment and delivery are handled by the selected platform.</p></div><div class="purchase-platforms-grid">${channels.map(c=>`<a class="platform-purchase ${c.id}" href="${escapeHtml(c.url)}" target="_blank" rel="noopener noreferrer"><span class="platform-logo"><img src="${assetUrl(c.logo)}" alt="" width="96" height="48"></span><span class="platform-copy"><strong>${c.label}</strong><span>${c.note}</span></span></a>`).join('')}</div></div>`+official;
}
function renderProducts(){const grid=qs('#products');if(!grid)return;const list=products.filter(p=>!p.isPlaceholder).filter(p=>p.kind==='physical'&&(filter==='all'||p.type===filter));grid.innerHTML=list.length?list.map(p=>`<article class="product-card"><button class="product-art" style="background:${escapeHtml(p.color)}" data-detail="${escapeHtml(p.id)}" aria-label="View ${escapeHtml(p.name)} details">${art(p)}${p.type==='file'?`<span class="card-stamp">${p.format}</span>`:''}</button><div class="product-info"><h3><button class="title-link" data-detail="${escapeHtml(p.id)}">${escapeHtml(p.name)}</button></h3><div class="card-bottom">${priceLabel(p)?`<span>${priceLabel(p)}</span>`:''}<button class="text-button card-details" data-detail="${escapeHtml(p.id)}">View details</button></div></div></article>`).join(''):document.body.dataset.catalog==='digital'?'':'<p class="catalog-note">No items match this selection.</p>';}
function setFilter(value){filter=value;document.querySelectorAll('[data-filter]').forEach(b=>{const active=b.dataset.filter===value;b.classList.toggle('active',active);b.setAttribute('aria-pressed',active)});renderProducts();}
function paragraphs(s){return String(s||'').split('\n').map(s=>s.trim()).filter(Boolean).map(s=>`<p>${escapeHtml(s)}</p>`).join('');}
function detail(id){
  if(products.some(p=>p.id===id && p.kind==='physical')){
    location.href='product.html?id='+encodeURIComponent(id);
  }
}
let galleryPhotos=[];
function renderFullProduct(){if(!qs('#full-product'))return;const id=new URLSearchParams(location.search).get('id');const p=products.find(p=>p.id===(id==='good-key'?'keynade-mx':id)&&p.kind==='physical');if(!p){qs('#full-product').innerHTML='<h1>Product not found.</h1><p>Please return to physical goods and choose another item.</p><a class="button yellow" href="products.html">Browse physical goods</a>';return;}
 document.title=p.name+' — One Goods Studio';const meta=document.querySelector('meta[name="description"]');if(meta)meta.content=p.desc||p.name;
 galleryPhotos=p.images||[];const photo=galleryPhotos[0];qs('#full-product').innerHTML=`<div class="keynade-intro"><div class="keynade-gallery">${photo?`<figure><img id="keynade-main-photo" src="${escapeHtml(assetUrl(photo.url))}" alt="${escapeHtml(p.name)} Product photo"></figure><div class="gallery-thumbs" role="group" aria-label="Product photo views">${galleryPhotos.map((im,i)=>`<button data-gallery-index="${i}" aria-label="${escapeHtml(p.name)} Product view ${i+1}" aria-pressed="${i===0}"><img src="${escapeHtml(assetUrl(im.url))}" alt="" loading="lazy"></button>`).join('')}</div>`:`<div class="product-art" style="background:${escapeHtml(p.color)}">${art(p)}</div>`}</div><div class="keynade-summary">${p.en?`<span class="eyebrow">${escapeHtml(p.en)}</span>`:''}<h1>${escapeHtml(p.name)}</h1>${p.keynadeFacts?'<p class="keynade-subtitle">12-Key Mechanical Fidget Grenade</p>':''}${paragraphs(p.detail)}${p.keynadeFacts?'<div class="keynade-facts"><span><b>12</b>Independent keys</span><span><b>MX</b>Switch format</span><span><b>1</b>Ball chain included</span></div>':''}${priceLabel(p)?`<p class="keynade-price">${priceLabel(p)}</p>`:''}${p.included ? paragraphs(p.included) : ''}${buyAction(p)}<p class="product-contact">Customer service <a href="mailto:aka051118@gmail.com">aka051118@gmail.com</a> · <a href="tel:0916662580">0916662580</a></p><a class="text-button" href="purchase-policy.html">Buying and licensing</a><p class="product-delivery">Check delivery options and shipping fees at checkout on Shopee or MyShip.</p></div></div>${p.keynadeFacts||p.desc||p.specs.length?`<section class="keynade-details">${p.keynadeFacts||p.desc?`<div><span class="eyebrow">THE LITTLE DETAILS</span><h2>${p.keynadeFacts?'A little more feel in every press.':'About this product'}</h2>${p.keynadeFacts?'<p>The twelve large geometric panels are independent mechanical keys. The top pin pulls out and slides back in as a decorative, hands-on detail.</p><p>Visible 3D print layers and gold sparkle are part of the real object. Sound and feel depend on the installed switches.</p>':paragraphs(p.desc)}</div>`:''}${p.specs.length?`<div class="keynade-specs"><h2>Specifications and included items</h2><dl>${(p.specs||[]).map(s=>`<div><dt>${escapeHtml(s.label)}</dt><dd>${escapeHtml(s.value)}</dd></div>`).join('')}</dl></div>`:''}</section>`:''}${p.keynadeFacts?'<section class="keynade-notes"><h2>About this little object</h2><p>The top pin is decorative. Small panels are fixed; twelve large panels can be pressed. Scene props in the photographs are not included.</p><p>Product photos are AI-assisted to harmonize color, lighting and backgrounds.</p></section>':''}`;}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.hasAttribute('data-open-policy'))qs('#info-dialog')?.showModal();if(b.dataset.filter)setFilter(b.dataset.filter);if(b.dataset.detail)detail(b.dataset.detail);if(b.hasAttribute('data-close'))b.closest('dialog').close();if(b.dataset.galleryIndex!==undefined){const i=Number(b.dataset.galleryIndex),p=galleryPhotos[i];if(!p)return;qs('#keynade-main-photo').src=assetUrl(p.url);qs('#keynade-main-photo').alt=document.title.split(' — ')[0];document.querySelectorAll('[data-gallery-index]').forEach(x=>x.setAttribute('aria-pressed',x===b));}});
if(qs('#open-info'))qs('#open-info').onclick=()=>qs('#info-dialog').showModal();
document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
if(qs('#year'))qs('#year').textContent=new Date().getFullYear();
const pages={home:'index.html',products:'products.html',designs:'design-files.html',about:'about.html',product:'products.html'};document.querySelectorAll('header nav:not(.language-switch) a,.catalog-nav a').forEach(a=>{if(a.getAttribute('href')===pages[document.body.dataset.page])a.setAttribute('aria-current','page');});
async function loadCatalog(){try{const [r,payment]=await Promise.all([fetch('/api/catalog',{cache:'no-store'}),paymentConfig()]);storePayment=payment;if(!r.ok)throw Error('catalog');const data=await r.json();categories=data.categories||[];products=data.items.map(localize);renderCategoryFilters();renderProducts();renderFullProduct();renderStoreCheckout();}catch{const target=qs('#products')||qs('#full-product')||qs('#store-checkout');if(target)target.innerHTML='<p role="alert">Product information could not be loaded. Please refresh the page.</p>';}}
function renderStoreCheckout(){
 const checkout=qs('#store-checkout');
 if(!checkout)return;
 const checkoutUrl=new URL(location.href);
 const test=storePayment.test === true;
 const livePickup=storePayment.enabled && !test && storePayment.pickupEnabled === true;
 if(storePayment.testRequested){checkout.innerHTML='<p role="alert">This test checkout requires an OGS administrator sign-in.</p><a class="button cream" href="/signin-with-chatgpt?return_to='+encodeURIComponent(location.pathname+location.search)+'">Administrator sign-in</a>';return;}
 const mapToken=checkoutUrl.searchParams.get('store');
 const draftKey=test?'ogs-pickup-stage-test':'ogs-pickup-live';
 let draft;
 try {
   const saved=JSON.parse(sessionStorage.getItem(draftKey));
   if(mapToken && saved?.token===mapToken) draft=saved;
 } catch {}
 const id=checkoutUrl.searchParams.get('product') || draft?.product;
 const product=products.find(p=>p.id===id);
 if(!canOrder(product)){
   checkout.innerHTML='<p role="status">This item is currently unavailable for direct ordering.</p><a class="button cream" href="products.html">Back to shop</a>';
   return;
 }
 const price=Number(product.price);
 const form=qs('#store-order-form');
 const quantity=qs('#store-quantity');
 const delivery=qs('#store-delivery');
 const carrier=qs('#store-carrier');
 const store=qs('#store-carrier-field');
 const chooseBranch=qs('#store-choose-branch');
 const branchResult=qs('#store-branch-result');
 const branchError=qs('#store-branch-error');
 const mapApi='/api/checkout-delivery-preview/';
 let selectedBranch;
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
     qs('#store-preview-note').hidden=false;qs('#store-preview-note').textContent=checkoutUrl.searchParams.get('map')==='live'?'The live map is for store-selection verification only. Use a sandbox store for the complete test.':'Internal test · Uses an ECPay sandbox store. No real charge or shipment.';
   }
   delivery.querySelector('[value=home]').textContent = 'Black Cat home delivery · NT$' + storePayment.shipping;
   address.hidden = address.disabled = false;
   pay.textContent = test?'Continue to ECPay test payment':'Continue to ECPay';
 }
 if (!test) delivery.value='home';
 if (!livePickup && !test) delivery.querySelector('[value=pickup]').remove();
 else {
   carrier.querySelectorAll('option').forEach(option=>{if(option.value!=='UNIMARTC2C')option.remove();});
   delivery.querySelector('[value=pickup]').textContent='7-ELEVEN Convenience-store pickup · NT$'+storePayment.pickupShipping;
 }
 if(!storePayment.enabled)pay.textContent='View buying options';
 const shippingFee=()=>delivery.value==='pickup'?storePayment.pickupShipping:(storePayment.shipping??100);
 const money=amount=>'NT$'+amount.toLocaleString('en-TW');

 qs('#store-back').href='product.html?id='+encodeURIComponent(product.id);
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
   const branch=isPickup && selectedBranch?.carrier===carrier.value ? selectedBranch : null;
   branchResult.hidden=!branch;
   chooseBranch.textContent=branch?'Change pickup store':'Choose pickup store';
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
   qs('#store-review-item').textContent=product.name+' × '+quantity.value;
   qs('#store-review-shipping').textContent=isPickup?delivery.selectedOptions[0].text.split(' · ')[0]+' · '+carrier.selectedOptions[0].text+(branch?' · '+branchLabel:''):delivery.selectedOptions[0].text.split(' · ')[0];
 }
 function showStep(step){
   sections.forEach((section,index)=>{section.hidden=index!==step;});
   sections[step].querySelector('h2').focus();
 }
 function showBranchError(message){
   branchError.textContent=message;
   branchError.hidden=false;
 }
 for(const input of [carrier,delivery]){
   input.addEventListener('change',()=>{ branchError.hidden=true; });
 }
 chooseBranch.addEventListener('click',async()=>{
   if(!quantity.reportValidity())return;
   const requestedCarrier=carrier.value;
   chooseBranch.disabled=true;
   branchError.hidden=true;
   try {
     const response=await fetch(mapApi+(test?'store-start':'public-store-start'),{
       method:'POST',headers:{'Content-Type':'application/json'},
       body:JSON.stringify({carrier:requestedCarrier,mobile:matchMedia('(max-width: 680px)').matches,language:document.documentElement.lang,...(test?{flow:'storefront-test',map:checkoutUrl.searchParams.get('map')}:{} )}),
     });
     const selection=await response.json();
     if(!response.ok || !(test ? ['https://logistics.ecpay.com.tw/Express/map','https://logistics-stage.ecpay.com.tw/Express/map'] : ['https://logistics.ecpay.com.tw/Express/map']).includes(selection.action))throw new Error();
     if(delivery.value!=='pickup' || carrier.value!==requestedCarrier || sections[1].hidden)return;
     sessionStorage.setItem(draftKey,JSON.stringify({
       token:selection.token,product:product.id,quantity:quantity.value,carrier:requestedCarrier,
       ...(test?{contact:form.elements.contact.value,phone:form.elements.phone.value,email:form.elements.email.value}:{}),
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
     showBranchError('Store selection is temporarily unavailable. Please try again.');
   } finally {
     chooseBranch.disabled=false;
   }
 });
 async function restoreBranch(){
   if((!livePickup&&!test) || draft?.product!==product.id || ![...carrier.options].some(option=>option.value===draft.carrier))return;
   checkoutUrl.searchParams.set('product',product.id);
   history.replaceState(null,'',checkoutUrl);
   delivery.value='pickup';
   carrier.value=draft.carrier;
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
     showBranchError('Choose your pickup store again.');
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
     if(delivery.value==='pickup' && selectedBranch?.carrier!==carrier.value){
       showBranchError('Choose a pickup store to continue.');
       chooseBranch.focus();
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
       const expectedTotal=price*count+shippingFee();
       toReview.disabled=true;
       branchError.hidden=true;
       try {
         const response=await fetch('/api/store-payment/quote',{
           method:'POST',headers:{'Content-Type':'application/json'},
           body:JSON.stringify({productId:product.id,quantity:count,method,storeToken:method==='pickup'?mapToken:null}),
         });
         const quote=await response.json();
         if(!response.ok)throw new Error(quote.error||'暂时无法核对Shipping，请重试。');
         if(sections[1].hidden || delivery.value!==method || quantity.valueAsNumber!==count)return;
         if(quote.amount!==expectedTotal || quote.shipping!==shippingFee())throw new Error('商品或Shipping已变更，请重新整理后确认。');
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
     error.textContent='Online card payments are being set up. You can currently buy on Shopee or MyShip.';
     error.hidden=false;
     const channels = document.createElement('div');
     channels.innerHTML=buyAction(product).replace(/<div class="store-order-entry">[\s\S]*?<\/div>/, '');
     error.replaceChildren(document.createTextNode(error.textContent),channels);
     return;
   }
   const payload = { ...Object.fromEntries(new FormData(form)), productId: product.id, quantity: quantity.valueAsNumber,method:delivery.value,storeToken:delivery.value==='pickup'?mapToken:null,
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
     if (!response.ok) throw new Error(result.error || 'Payment is temporarily unavailable.');
     if(test){if(!/^\/api\/checkout-preview\/payment\/OGS-DEMO-[A-F0-9]{12}$/.test(result.checkoutUrl||''))throw new Error('Payment is temporarily unavailable.');location.assign(result.checkoutUrl);return;}
     if (result.receipt) {
       location.assign(result.receipt);
       return;
     }
     if (result.action !== 'https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5') throw new Error('Payment is temporarily unavailable.');
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
