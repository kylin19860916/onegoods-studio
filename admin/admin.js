'use strict';
const $=s=>document.querySelector(s),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const defaults=()=>({status:'published',query:'',category:'all',record:'all',sale:'all',sort:'display'});
const statusLabels={published:'前台展示中',draft:'草稿',archived:'已封存',all:'全部狀態'};
const state={items:[],assets:[],categories:[],categoryCurrent:null,categoryDirty:false,kind:'physical',filters:{physical:defaults(),design:defaults()},current:null,isNew:false,dirty:false,busy:false};
const form=$('#product-form');
const assetPreview=u=>u.startsWith('/media/')?'/api/admin/assets/'+u.slice(7):u.startsWith('assets/')?'/'+u:u;
function notify(message,error=false){const e=$('#notice');e.hidden=false;e.className='notice'+(error?' error':'');e.textContent=message;}
async function api(path,options={}){const r=await fetch('/api/admin/'+path,{cache:'no-store',...options,headers:{...(options.body&&!(options.body instanceof FormData)?{'Content-Type':'application/json'}:{}),...options.headers}});let data;try{data=await r.json();}catch{throw Error('伺服器暫時無法回應，請稍後再試。');}if(!r.ok){if(r.status===401){notify('登入已到期，請重新登入。',true);location.href='/signin-with-chatgpt?return_to=%2Fadmin';}throw Error(data.error||'操作失敗，請稍後重試。');}return data;}
function setBusy(on){state.busy=on;document.querySelectorAll('#product-form button,#category-form button,#category-form input,#new-category,.nav-item,#new-item,#refresh,.upload-button input').forEach(b=>b.disabled=on||b.dataset.imageUp==='0'||(b.dataset.imageDown!==undefined&&Number(b.dataset.imageDown)===(state.current?.images.length||0)-1));$('.save').textContent=on?'處理中…':'儲存商品';}
async function refresh(){const [catalog,assets,categories]=await Promise.all([api('catalog'),api('assets'),api('categories')]);state.items=catalog.items;state.assets=assets.items;state.categories=categories.items;syncCategoryOptions();renderList();renderCategories();}
function categoryName(id){return id==='file'?'設計檔案':state.categories.find(c=>c.id===id)?.name||id;}
function syncCategoryOptions(selected=state.current?.category){
 const filter=$('#category-filter'),selection=filter.value||state.filters.physical.category;
 filter.innerHTML='<option value="all">全部分類</option>'+state.categories.map(c=>`<option value="${esc(c.id)}">${esc(c.name)}${c.active?'':'（已停用）'}</option>`).join('');
 filter.value=state.categories.some(c=>c.id===selection)?selection:'all';
 const select=field('category');select.innerHTML='<option value="">請選擇分類</option>'+state.categories.filter(c=>c.active||c.id===selected).map(c=>`<option value="${esc(c.id)}">${esc(c.name)}${c.active?'':'（已停用）'}</option>`).join('');select.value=selected||'';
}
function categoryField(name){return $('#category-form').elements.namedItem(name);}
function editCategory(c=null){state.categoryCurrent=c?structuredClone(c):null;state.categoryDirty=false;$('#category-form').reset();categoryField('name').value=c?.name||'';categoryField('nameEn').value=c?.nameEn||'';categoryField('nameZhHans').value=c?.nameZhHans||'';categoryField('sortOrder').value=c?.sortOrder??Math.max(0,...state.categories.map(c=>c.sortOrder))+10;categoryField('active').checked=c?.active??true;$('#category-editor-title').textContent=c?'編輯分類':'新增分類';renderCategories();}
function renderCategories(){if(!$('#category-list'))return;$('#category-list').innerHTML=state.categories.map(c=>{const used=state.items.filter(p=>p.kind==='physical'&&p.category===c.id).length;return `<article class="category-row ${state.categoryCurrent?.id===c.id?'selected':''}"><div><h3>${esc(c.name)}<span class="badge ${c.active?'published':'archived'}">${c.active?'啟用中':'已停用'}</span></h3><small>${used} 筆商品（含草稿與封存） · 順序 ${c.sortOrder}</small></div><button type="button" data-category-edit="${esc(c.id)}" aria-label="編輯分類 ${esc(c.name)}">編輯</button></article>`;}).join('')||'<p class="help">還沒有分類，從右側新增第一個分類。</p>';}
function showCategories(){if(!canLeave()||state.busy)return;hideClickerOrders();state.dirty=false;state.current=null;$('#editor-view').hidden=true;$('#catalog-view').hidden=true;$('#categories-view').hidden=false;$('#new-item').hidden=true;document.querySelectorAll('[data-kind]').forEach(b=>b.classList.remove('active'));$('#manage-categories').classList.add('active');$('#page-title').textContent='分類管理';$('#page-description').textContent='依照你的商品系列，自由整理分類。';editCategory();}
async function saveCategory(){if(state.busy||!$('#category-form').reportValidity())return;const current=state.categoryCurrent,body={name:categoryField('name').value,nameEn:categoryField('nameEn').value,nameZhHans:categoryField('nameZhHans').value,sortOrder:Number(categoryField('sortOrder').value),active:categoryField('active').checked,revision:current?.revision};setBusy(true);try{const {item}=await api('categories'+(current?'/'+current.id:''),{method:current?'PUT':'POST',body:JSON.stringify(body)});state.categoryDirty=false;await refresh();editCategory(item);notify('分類已儲存，商品選單與篩選已同步更新。');}catch(e){notify(e.message,true);}finally{setBusy(false);}}
$('#manage-categories').onclick=showCategories;$('#new-category').onclick=()=>{if(canLeave())editCategory();};$('#category-form').addEventListener('input',()=>state.categoryDirty=true);$('#category-form').onsubmit=e=>{e.preventDefault();saveCategory();};$('#category-list').onclick=e=>{const b=e.target.closest('[data-category-edit]');if(b&&canLeave())editCategory(state.categories.find(c=>c.id===b.dataset.categoryEdit));};
const normalize=v=>String(v??'').normalize('NFKC').toLocaleLowerCase().replace(/\s+/g,' ').trim();
function syncFilters(){const f=state.filters[state.kind];$('#search').value=f.query;for(const [id,key]of [['category','category'],['record','record'],['sale','sale'],['sort','sort']])$('#'+id+'-filter').value=f[key];$('#category-filter-field').hidden=state.kind==='design';}
function resetFilters(){state.filters[state.kind]=defaults();syncFilters();renderList();}
function renderList(){
 const f=state.filters[state.kind],all=state.items.filter(p=>p.kind===state.kind),terms=normalize(f.query).split(' ').filter(Boolean);
 const items=all.filter(p=>(f.status==='all'||p.status===f.status)&&(f.category==='all'||p.category===f.category)&&(f.record==='all'||(f.record==='placeholder')===!!p.isPlaceholder)&&(f.sale==='all'||p.saleStatus===f.sale)&&terms.every(t=>normalize([p.name,p.id,p.managementCode,p.translations?.en?.name,p.translations?.['zh-Hans']?.name].join(' ')).includes(t)));
 const byNumber=(a,b)=>(a.managementCode||a.id).localeCompare(b.managementCode||b.id, 'en',{numeric:true});
 items.sort((a,b)=>(f.sort==='updated'?new Date(b.updatedAt)-new Date(a.updatedAt):f.sort==='name'?a.name.localeCompare(b.name,'zh-Hant'):f.sort==='number'?byNumber(a,b):a.sortOrder-b.sortOrder)||byNumber(a,b));
 $('#physical-count').textContent=state.items.filter(p=>p.kind==='physical').length;$('#design-count').textContent=state.items.filter(p=>p.kind==='design').length;
 $('#status-tabs').innerHTML=['published','draft','archived','all'].map(status=>`<button type="button" data-status="${status}" aria-pressed="${f.status===status}">${statusLabels[status]}<span>${status==='all'?all.length:all.filter(p=>p.status===status).length}</span></button>`).join('');
 const labels=[statusLabels[f.status],f.category==='all'?'':categoryName(f.category),f.record==='all'?'':f.record==='placeholder'?'類別示意':'正式商品',f.sale==='all'?'':f.sale==='available'?'已開售':'尚未開售'].filter(Boolean);
 $('#list-summary').textContent=`顯示 ${items.length} 筆 / 此區共 ${all.length} 筆 · ${labels.join(' · ')}`;
 $('#reset-filters').hidden=JSON.stringify(f)===JSON.stringify(defaults());
 const card=p=>`<article class="catalog-item"><div class="catalog-thumb" style="background:${esc(p.color)}">${p.images[0]?`<img src="${esc(assetPreview(p.images[0].url))}" alt="">`:''}</div><div class="catalog-details"><div class="item-heading"><span class="item-code">${esc(p.managementCode||'編號待建立')}</span><span class="badge ${p.status}">${statusLabels[p.status]}</span>${p.isPlaceholder?'<span class="badge placeholder">類別示意</span>':''}</div><h3>${esc(p.name)}</h3><div class="item-facts"><span>${esc(categoryName(p.category))}</span><span>${p.price===null?'售價未公布':'NT$'+Number(p.price).toLocaleString()}</span><span>${p.saleStatus==='available'?'已開售':'尚未開售'}</span></div><p>${esc(p.description)}</p><small>網址代號 ${esc(p.id)} · 前台順序 ${p.sortOrder} · 更新 ${esc(new Date(p.updatedAt).toLocaleDateString('zh-TW'))}</small></div><button data-edit="${esc(p.id)}" aria-label="編輯 ${esc(p.name)} ${esc(p.managementCode||'')}">編輯</button></article>`;
 $('#catalog-list').innerHTML=items.length?(f.status==='all'?['published','draft','archived'].map(status=>{const group=items.filter(p=>p.status===status);return group.length?`<section class="status-group" aria-label="${statusLabels[status]}"><h2>${statusLabels[status]}<span>${group.length} 筆</span></h2>${group.map(card).join('')}</section>`:'';}).join(''):items.map(card).join('')):`<div class="empty"><h2>沒有符合條件的資料</h2><p>目前查看「${statusLabels[f.status]}」。可以調整搜尋或篩選，或查看其他狀態。</p><button type="button" data-show-all>查看所有資料</button></div>`;
}
function canLeave(){return !(state.dirty||state.categoryDirty)||confirm('還有尚未儲存的修改，要離開這筆資料嗎？');}
function showList(){hideClickerOrders();state.dirty=false;state.categoryDirty=false;state.current=null;$('#categories-view').hidden=true;$('#editor-view').hidden=true;$('#catalog-view').hidden=false;$('#new-item').hidden=false;renderList();}
function selectKind(kind){if(!canLeave())return;state.kind=kind;syncFilters();$('#manage-categories').classList.remove('active');document.querySelectorAll('[data-kind]').forEach(b=>b.classList.toggle('active',b.dataset.kind===kind));$('#page-title').textContent=kind==='physical'?'實體商品':'設計檔案';$('#page-description').textContent=kind==='physical'?'從一個點子，整理成準備亮相的小物。':'把原創設計、版本與製作說明，整理在同一處。';$('#new-item').textContent=kind==='physical'?'新增實體商品':'新增設計檔案';showList();}
function blank(){return {id:'ogs-'+Date.now().toString(36),kind:state.kind,category:state.kind==='design'?'file':state.categories.find(c=>c.active)?.id||'',status:'draft',saleStatus:'coming_soon',name:'',tagline:'',description:'',detail:'',price:null,color:'#eee8f4',sortOrder:(Math.max(0,...state.items.map(p=>p.sortOrder))+10),images:[],specs:[],fileIds:[],translations:{en:{},'zh-Hans':{}},purchaseUrl:'',shopeeUrl:'',makerworldUrl:state.kind==='design'?'https://makerworld.com/zh/@OGStudio':'',version:'',license:'',printingNotes:'',included:'',internalNotes:'',isPlaceholder:false,keynadeFacts:false};}
function field(name){return form.elements.namedItem(name);}
function openEditor(p,isNew=false){if(!canLeave())return;state.current=structuredClone(p);state.categoryDirty=false;$('#categories-view').hidden=true;syncCategoryOptions(p.category);state.isNew=isNew;state.dirty=false;form.reset();for(const [key,value]of Object.entries(p)){const e=field(key);if(!e)continue;if(e.type==='checkbox')e.checked=!!value;else e.value=value??'';}field('id').readOnly=!isNew;$('#catalog-view').hidden=true;$('#editor-view').hidden=false;$('#new-item').hidden=true;$('#management-code').textContent=p.managementCode||'儲存後自動編號';$('#edit-state').textContent=isNew?'新資料 · 尚未儲存':`上次儲存 ${new Date(p.updatedAt).toLocaleString('zh-TW')}`;document.querySelectorAll('.design-fields').forEach(e=>e.hidden=p.kind!=='design');document.querySelectorAll('.physical-fields').forEach(e=>e.hidden=p.kind!=='physical');$('#category-field').hidden=p.kind==='design';field('category').required=p.kind==='physical';$('#archive-item').hidden=isNew||p.status==='archived';$('#view-public').hidden=isNew||p.status!=='published';$('#translation-fields').innerHTML=['en','zh-Hans'].map(lang=>`<h3>${lang==='en'?'English':'简体中文'}</h3>${[['name','名稱'],['tagline','標語'],['description','卡片簡介'],['detail','詳細介紹'],['license','使用授權'],['printingNotes','列印與組裝說明']].map(([key,label])=>`<label>${label}<textarea data-translation="${lang}" data-key="${key}" rows="${key==='detail'?4:2}" maxlength="${key==='detail'?15000:key==='description'?2000:150}">${esc(p.translations?.[lang]?.[key]||'')}</textarea></label>`).join('')}`).join('');renderImages();renderSpecs();renderFiles();preview();window.scrollTo({top:0,behavior:'smooth'});}
function collect(){const p=structuredClone(state.current);for(const e of form.elements){if(!e.name)continue;if(e.type==='checkbox')p[e.name]=e.checked;else p[e.name]=e.value;}p.price=field('price').value===''?null:Number(field('price').value);p.sortOrder=Number(field('sortOrder').value)||0;p.specs=[...$('#spec-list').querySelectorAll('.spec-row')].map(r=>({label:r.querySelector('[data-spec-label]').value,value:r.querySelector('[data-spec-value]').value})).filter(s=>s.label&&s.value);p.translations=structuredClone(state.current.translations||{en:{},'zh-Hans':{}});p.translations.en||={};p.translations['zh-Hans']||={};document.querySelectorAll('[data-translation]').forEach(e=>p.translations[e.dataset.translation][e.dataset.key]=e.value);return p;}
function preview(){if(!state.current)return;$('#preview-name').textContent=field('name').value||'商品名稱';$('#preview-tagline').textContent=field('tagline').value;$('#preview-description').textContent=field('description').value;$('#preview-price').textContent=field('price').value===''?'售價未公布':'NT$'+Number(field('price').value).toLocaleString();const im=state.current.images[0];$('#preview-image').style.background=field('color').value;$('#preview-image').innerHTML=im?`<img src="${esc(assetPreview(im.url))}" alt="${esc(im.alt)}">`:'';}
function renderImages(){$('#image-list').innerHTML=state.current.images.length?state.current.images.map((im,i)=>`<div class="image-row"><img src="${esc(assetPreview(im.url))}" alt="${esc(im.alt)}"><div><input data-image-alt="${i}" value="${esc(im.alt)}" maxlength="250" aria-label="第${i+1}張圖片說明" placeholder="圖片說明"><div class="small-actions">${i===0?'<span class="badge">主圖</span>':''}<button type="button" data-image-up="${i}" ${i===0?'disabled':''}>往前</button><button type="button" data-image-down="${i}" ${i===state.current.images.length-1?'disabled':''}>往後</button><button type="button" data-image-remove="${i}">移除</button></div></div></div>`).join(''):'<p class="help">尚未加入圖片，前台會保留圖片位置。</p>';}
function renderSpecs(){$('#spec-list').innerHTML=state.current.specs.map((s,i)=>`<div class="spec-row"><input data-spec-label value="${esc(s.label)}" placeholder="項目，例如材質" maxlength="100" aria-label="規格項目"><input data-spec-value value="${esc(s.value)}" placeholder="已確認的內容" maxlength="1000" aria-label="規格內容"><button type="button" data-spec-remove="${i}" aria-label="移除規格">移除</button></div>`).join('');}
function renderFiles(){$('#file-list').innerHTML=state.current.fileIds.map(id=>{const a=state.assets.find(a=>a.id===id);return `<div class="file-row"><a href="/api/admin/assets/${esc(id)}" download>${esc(a?.name||id)}</a><button type="button" data-file-remove="${esc(id)}">移除關聯</button></div>`;}).join('')||'<p class="help">尚未加入附件。</p>';}
async function upload(input,kind){const files=[...input.files];input.value='';if(!files.length)return;if(kind==='image'&&state.current.images.length+files.length>12){notify('每筆商品最多12張圖片。',true);return;}setBusy(true);try{for(const file of files){const body=new FormData();body.append('file',file);body.append('kind',kind);const asset=await api('upload',{method:'POST',body});state.assets.unshift(asset);if(kind==='image')state.current.images.push({url:asset.url,alt:file.name.replace(/\.[^.]+$/,'')});else state.current.fileIds.push(asset.id);state.dirty=true;}renderImages();renderFiles();preview();notify('上傳完成。儲存商品後變更才會生效。');}catch(e){renderImages();renderFiles();preview();notify(e.message,true);}finally{setBusy(false);}}
async function save(){if(state.busy)return;if(!form.reportValidity())return;const p=collect();setBusy(true);try{const data=await api('catalog'+(state.isNew?'':'/'+encodeURIComponent(p.id)),{method:state.isNew?'POST':'PUT',body:JSON.stringify(p)});state.dirty=false;state.current=data.item;state.isNew=false;await refresh();openEditor(data.item);notify('已儲存。'+(p.status==='published'?'官網將顯示最新資料。':'這筆資料目前不會顯示在官網。'));}catch(e){notify(e.message,true);}finally{setBusy(false);}}
form.addEventListener('submit',e=>{e.preventDefault();save();});form.addEventListener('input',e=>{state.dirty=true;if(e.target.dataset.imageAlt!==undefined)state.current.images[Number(e.target.dataset.imageAlt)].alt=e.target.value;preview();});
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.kind)selectKind(b.dataset.kind);if(b.dataset.status){state.filters[state.kind].status=b.dataset.status;renderList();}if(b.hasAttribute('data-show-all')){state.filters[state.kind]=defaults();state.filters[state.kind].status='all';syncFilters();renderList();}if(b.dataset.edit)openEditor(state.items.find(p=>p.id===b.dataset.edit));for(const [action,delta]of [['imageUp',-1],['imageDown',1]]){if(b.dataset[action]!==undefined){const i=Number(b.dataset[action]),j=i+delta;if(j>=0&&j<state.current.images.length){[state.current.images[i],state.current.images[j]]=[state.current.images[j],state.current.images[i]];state.dirty=true;renderImages();preview();}}}if(b.dataset.imageRemove!==undefined){state.current.images.splice(Number(b.dataset.imageRemove),1);state.dirty=true;renderImages();preview();}if(b.dataset.specRemove!==undefined){state.current.specs=collect().specs;state.current.specs.splice(Number(b.dataset.specRemove),1);state.dirty=true;renderSpecs();}if(b.dataset.fileRemove){state.current.fileIds=state.current.fileIds.filter(id=>id!==b.dataset.fileRemove);state.dirty=true;renderFiles();}});
$('#new-item').onclick=()=>openEditor(blank(),true);$('#back-list').onclick=()=>{if(canLeave())showList();};$('#search').oninput=()=>{state.filters[state.kind].query=$('#search').value;renderList();};for(const [id,key]of [['category','category'],['record','record'],['sale','sale'],['sort','sort']])$('#'+id+'-filter').onchange=()=>{state.filters[state.kind][key]=$('#'+id+'-filter').value;renderList();};$('#reset-filters').onclick=resetFilters;$('#refresh').onclick=()=>refresh().then(()=>notify('列表已更新。')).catch(e=>notify(e.message,true));$('#add-spec').onclick=()=>{state.current.specs=collect().specs;state.current.specs.push({label:'',value:''});state.dirty=true;renderSpecs();};$('#image-upload').onchange=e=>upload(e.target,'image');$('#design-upload').onchange=e=>upload(e.target,'design');$('#archive-item').onclick=()=>{if(confirm('封存後會從官網移除，之後仍可恢復。要封存嗎？')){field('status').value='archived';state.dirty=true;save();}};$('#view-public').onclick=()=>window.open(state.current.kind==='design'?'/design-files.html':'/product.html?id='+encodeURIComponent(state.current.id),'_blank','noopener');
$('#backup').onclick=async()=>{try{const [{items},{items:categories}]=await Promise.all([api('catalog'),api('categories')]);const blob=new Blob([JSON.stringify({brand:'One Goods Studio',exportedAt:new Date().toISOString(),items,categories},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='OGS-catalog-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(e){notify(e.message,true);}};
window.addEventListener('beforeunload',e=>{if(state.dirty||state.categoryDirty){e.preventDefault();e.returnValue='';}});
(async()=>{try{const session=await api('session');$('#account').textContent=session.email;await api('initialize',{method:'POST',body:'{}'});await refresh();if(isOrderRoute()){const id=new URLSearchParams(location.search).get('clicker-order');if(/^OGS-(?:E|T|P|DEMO)-[A-F0-9]{12}$/.test(id||'')) orderSearch.elements.query.value=id; showClickerOrders();}}catch(e){notify(e.message,true);$('#list-summary').textContent='資料未能載入。';}})();

const orderList = $('#clicker-order-list');
const orderSearch = $('#clicker-order-search');
const orderView = $('#clicker-orders-view');
const orderNav = $('#manage-clicker-orders');
const orderColors = {'#a087c1':'薰衣草紫','#fffcf5':'奶油白','#f2c879':'蜂蜜金','#393142':'炭灰','#b8d6bd':'薄荷綠','#efb39e':'蜜桃粉'};
const orderFonts = {huninn:'粉圓','sans-tc':'繁體黑體','serif-tc':'繁體宋體','sans-sc':'簡體黑體','serif-sc':'簡體宋體',wenkai:'文楷',kuaile:'快樂體',lucky:'Luckiest Guy',nunito:'Nunito',lobster:'Lobster',lilita:'Lilita One',chewy:'Chewy',yellowtail:'Yellowtail',blackops:'Black Ops One'};
const orderDate = new Intl.DateTimeFormat('zh-TW', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Asia/Taipei' });
let orderSearchVersion = 0;
let orders = [];
let orderStatusFilter = 'all';
let orderSort = { field: 'date', direction: 'descending' };
let shippingTools = false;
const listView = $('#order-list-view');
const detailView = $('#order-detail-view');
const detailContent = $('#order-detail');
const money = amount => 'NT$' + Number(amount).toLocaleString('en-TW');
const formatOrderDate = value => value ? orderDate.format(new Date(value)) : '—';
const orderStatuses = { unpaid: '待付款', active: '進行中', pending: '待寄件', complete: '已完成', attention: '待處理' };

function isOrderRoute() {
  return location.hash === '#clicker-orders' || /^#orders(?:\/|$)/.test(location.hash);
}

function orderStatus(order) {
  if (order.tier === 'mechanical-test') return 'complete';
  if (order.paymentState === 'failure') return 'attention';
  if (!order.previewPaid && !order.matchedReference) return 'unpaid';
  const status = String(order.shipment?.status ?? '');
  if (['2067','3022'].includes(status)) return 'complete';
  if (['2074','3020','2099','create_failed','create_unknown'].includes(status)) return 'attention';
  if (status === '300' || (order.live && order.matchedReference)) return 'pending';
  return 'active';
}

function hideClickerOrders() {
  orderView.hidden = true;
  orderNav.classList.remove('active');
  if (isOrderRoute()) history.replaceState(null, '', location.pathname + location.search);
}

function showClickerOrders() {
  if (!canLeave() || state.busy) return;
  state.dirty = false;
  state.categoryDirty = false;
  state.current = null;
  for (const id of ['catalog-view', 'categories-view', 'editor-view', 'new-item']) $('#' + id).hidden = true;
  document.querySelectorAll('.nav-item').forEach(button => button.classList.toggle('active', button === orderNav));
  $('#page-title').textContent = '訂單';
  $('#page-description').textContent = '管理客製訂單和商品訂單。';
  if (!isOrderRoute()) history.replaceState(null, '', location.pathname + '#orders');
  orderView.hidden = false;
  loadClickerOrders();
}

function orderSwatch(label, color) {
  const name = orderColors[color];
  return `<span class="order-swatch"><i aria-hidden="true" style="background:${name ? color : 'transparent'}"></i>${label} ${esc(name || color)}</span>`;
}

function renderClickerOrder(order) {
  const { id, design, tier, amount, checkoutCreated, matchedReference, matchedAt } = order;
  if (design.style === 'mechanical') {
    return `<article class="panel clicker-order-item"><div class="panel-title"><h2>${esc(design.text)}</h2><span class="badge">3MF 測試</span></div>
      <p><strong>${esc(id)}</strong> · 機械鍵盤款 · ${design.keys.length} 鍵 · ${formatOrderDate(order.createdAt)}</p>
      <div class="order-swatches">${orderSwatch('底座', design.base)}</div>
      <ol>${design.keys.map(key => `<li>${esc(key.text || '空白鍵')} · ${esc(orderFonts[key.font] || key.font)}
      <div class="order-swatches">${orderSwatch('鍵帽', key.cap)}${key.text ? orderSwatch('文字', key.ink) : ''}</div></li>`).join('')}</ol>
      <div class="order-toolbar"><a class="text-action" href="/api/admin/clicker-orders/${esc(id)}/3mf" download>下載 3MF</a></div></article>`;
  }
  const delivery = order.delivery;
  const address = delivery?.address;
  const store = delivery?.store;
  const destination = store
    ? [store.carrier, store.name, store.id, store.address].join(' · ')
    : address ? [address.postalCode, address.city + address.district + address.street, address.unit].filter(Boolean).join(' ') : '';
  const ecpay = tier === 'ecpay-stage';
  const status = order.previewPaid && !ecpay ? '模擬付款完成' : ecpay
    ? matchedReference ? '測試付款成功 · 已配對' : '待綠界測試付款'
    : matchedReference ? '已配對（測試）' : checkoutCreated ? '待配對' : '待模擬下單';
  const matchForm = !ecpay && checkoutCreated && !matchedReference
    ? `<form class="order-match" data-match-order="${esc(id)}"><label>模擬賣貨便單號<input name="reference" required maxlength="24" autocomplete="off"></label><label>商品金額（不含運）<input name="amount" type="number" min="1" step="1" required></label><button class="primary">確認配對</button><span role="status"></span></form>`
    : '';
  const shipment = order.shipment;
  const logistics = destination && order.previewPaid ? `<div class="order-toolbar">
    <button type="button" class="text-action" data-logistics-action="${shipment ? 'query' : 'create'}" data-order-id="${esc(id)}">${shipment ? '查詢綠界物流測試單' : '建立綠界物流測試單'}</button>
    ${shipment?.id && shipment.subtype === 'UNIMARTC2C' ? `<button type="button" class="text-action" data-logistics-action="code" data-order-id="${esc(id)}">複製交貨便代碼</button><button type="button" class="text-action" data-logistics-action="print" data-order-id="${esc(id)}">列印託運單</button>` : ''}
    ${shipment?.id ? `<span>物流單號 ${esc(shipment.id)} · 貨態 ${esc(shipment.status)}${shipment.notice ? ' · 已收到通知' : ''}</span>` : ''}
    <span role="status"></span></div>` : '';
  return `<article class="panel clicker-order-item"><div class="panel-title"><h2>${esc(design.text)}</h2><span class="badge">${status}</span></div>
    <p><strong>${esc(id)}</strong> · 連字按壓款 · ${esc(orderDate.format(new Date(order.createdAt)))}</p>
    <p>字型 ${esc(orderFonts[design.font] || design.font)} · ${ecpay ? '綠界測試' : '測試價位 ' + (tier === 'test-a' ? 'A' : 'B')} · NT$${amount}</p>
    <div class="order-swatches">${orderSwatch('外框', design.colors.border)}${orderSwatch('內底', design.colors.fill)}${orderSwatch('凸字', design.colors.ink)}</div>
    ${matchedReference ? `<p>${ecpay ? '綠界測試交易編號' : '模擬賣貨便單號'} <strong>${esc(matchedReference)}</strong> · ${esc(orderDate.format(new Date(matchedAt)))}</p>` : ''}
    ${destination ? `<fieldset><legend>配送資料（測試）</legend><p>${esc(delivery.contact)} · ${esc(delivery.phone)}</p>
      <label>${store ? '取貨門市' : '收件地址'}<input aria-label="${store ? '取貨門市' : '收件地址'}" value="${esc(destination)}" readonly></label></fieldset>` : ''}
    ${matchForm}
    ${logistics}
    <div class="order-toolbar"><a class="text-action" href="/api/admin/clicker-orders/${esc(id)}/3mf" download>下載 3MF</a>${checkoutCreated || matchedReference || tier === 'checkout-preview' ? '' : `<a class="text-action" href="/api/clicker-orders/test/${esc(id)}/checkout/${esc(tier)}">${ecpay ? '前往綠界測試付款' : '繼續模擬下單'}</a>`}</div>
    </article>`;
}

function physicalLogisticsTools(order) {
  if(order.live || !order.matchedReference || !order.id.startsWith('OGS-DEMO-')) return '';
  const shipment=order.shipment;
  return `<div class="order-toolbar"><button type="button" class="text-action" data-logistics-action="${shipment?'query':'create'}" data-order-id="${esc(order.id)}">${shipment?'查詢綠界物流測試單':'建立綠界物流測試單'}</button>
  ${shipment && !shipment.id?`<button type="button" class="text-action" data-logistics-action="retry-create" data-order-id="${esc(order.id)}">查無原單後重試測試建單</button>`:''}
  ${shipment?.id?'<small>測試面單是綠界固定示意，無法寄送；門市請核對原訂單及建單紀錄。</small>':''}
  ${shipment?.id && shipment.subtype==='UNIMARTC2C'?`<button type="button" class="text-action" data-logistics-action="code" data-order-id="${esc(order.id)}">複製交貨便代碼</button><button type="button" class="text-action" data-logistics-action="print" data-order-id="${esc(order.id)}">列印託運單</button>`:''}
  ${shipment?.error?`<p role="alert">綠界測試建單失敗：${esc(shipment.error)}</p>`:''}
  ${shipment?.id?`<span>物流單號 ${esc(shipment.id)} · 貨態 ${esc(shipment.status)}${shipment.notice?' · 已收到通知':''}</span>`:''}<span role="status"></span></div>`;
}

function renderPhysicalOrder(order) {
  const { delivery } = order;
  const store = delivery?.store;
  const address = delivery?.address;
  const destination = store
    ? [store.carrier, store.name, store.id, store.address].filter(Boolean).join(' · ')
    : address ? [address.postalCode, address.city + address.district + address.street, address.unit].filter(Boolean).join(' ') : '';
  return `<article class="panel clicker-order-item"><div class="panel-title"><h2>${esc(order.name)}</h2><span class="badge">${orderStatuses[orderStatus(order)]}</span></div>
    <p><strong>${esc(order.id)}</strong> · ${order.live?'商品訂單':'商品訂單（綠界測試）'} · ${formatOrderDate(order.createdAt)}</p>
    <p>數量 ${esc(order.quantity)} · 商品小計 ${money(order.subtotal)} · 運費 ${money(order.shipping)} · 合計 ${money(order.amount)}</p>
    ${order.matchedReference ? `<p>綠界交易編號 ${esc(order.matchedReference)} · ${formatOrderDate(order.matchedAt)}</p>` : ''}
    ${destination ? `<fieldset><legend>${order.live ? (store ? '7-ELEVEN 超商取貨' : '黑貓宅配') : '配送資料（測試）'}</legend><p>${esc(delivery.contact)} · ${esc(delivery.phone)}</p><p>${esc(destination)}</p>${order.live ? `<p>${esc(delivery.email)}</p>` : ''}</fieldset>` : ''}
    ${physicalLogisticsTools(order)}
    </article>`;
}

const orderCollator = new Intl.Collator('zh-TW', { numeric: true, sensitivity: 'base' });
const orderStatusRanks = Object.keys(orderStatuses);
const orderSortColumns = { date: '日期', kind: '類型', item: '品項', status: '狀態' };
const orderItemName = order => order.design?.text || order.name || '';

function orderSortHeader(field) {
  const active = field === orderSort.field;
  const arrow = active ? (orderSort.direction === 'ascending' ? '↑' : '↓') : '↕';
  return `<th scope="col"${active ? ` aria-sort="${orderSort.direction}"` : ''}><button class="order-sort" type="button" data-order-sort="${field}">${orderSortColumns[field]} <span aria-hidden="true">${arrow}</span></button></th>`;
}

function sortVisibleOrders(left, right) {
  const leftDate = Date.parse(left.createdAt);
  const rightDate = Date.parse(right.createdAt);
  const dateOrder = (rightDate || 0) - (leftDate || 0);
  const direction = orderSort.direction === 'ascending' ? 1 : -1;
  if (orderSort.field === 'date') {
    if (Number.isFinite(leftDate) !== Number.isFinite(rightDate)) return Number.isFinite(leftDate) ? -1 : 1;
    return -dateOrder * direction;
  }
  const compare = {
    kind: () => orderCollator.compare(left.kind, right.kind),
    item: () => orderCollator.compare(orderItemName(left), orderItemName(right)),
    status: () => orderStatusRanks.indexOf(orderStatus(left)) - orderStatusRanks.indexOf(orderStatus(right)),
  };
  return compare[orderSort.field]() * direction || dateOrder;
}

function renderOrderView() {
  const detailId = /^#orders\/(OGS-(?:T|E|P|DEMO)-[A-F0-9]{12})$/.exec(location.hash)?.[1];
  listView.hidden = Boolean(detailId);
  detailView.hidden = !detailId;
  $('#page-title').textContent = detailId ? '訂單詳情' : '訂單';
  $('#page-description').textContent = detailId || '管理客製訂單和商品訂單。';
  if (detailId) {
    const order = orders.find(item => item.id === detailId);
    detailContent.innerHTML = order ? (order.kind === 'physical' ? renderPhysicalOrder(order) : renderClickerOrder(order))
      : '<p>目前找不到這筆訂單。</p>';
    return;
  }
  detailContent.replaceChildren();
  $('#pending-shipments').hidden = !shippingTools || orderStatusFilter !== 'pending';
  const type = $('#order-type-filter').value;
  const query = orderSearch.elements.query.value.trim().toLowerCase();
  const visible = orders.filter(order => {
    const name = orderItemName(order);
    const keywords = [order.id, name, order.matchedReference, order.searchReference, order.delivery?.contact];
    return (type === 'all' || type === order.kind) &&
      (orderStatusFilter === 'all' || orderStatusFilter === orderStatus(order)) &&
      (!query || keywords.some(value => value?.toLowerCase().includes(query)));
  }).sort(sortVisibleOrders);
  orderList.innerHTML = visible.length ? `<table class="orders-table">
    <thead><tr><th scope="col">訂單</th>${orderSortHeader('date')}${orderSortHeader('kind')}${orderSortHeader('item')}<th scope="col">金額</th>${orderSortHeader('status')}</tr></thead>
    <tbody>${visible.map(order => {
      const status = orderStatus(order);
      return `<tr><td><a href="#orders/${esc(order.id)}">${esc(order.id)}</a></td><td>${formatOrderDate(order.createdAt)}</td>
      <td>${order.kind === 'custom' ? '客製' : '商品'}</td><td>${esc(orderItemName(order))}</td>
      <td>${order.tier === 'mechanical-test' ? '—' : money(order.amount)}</td><td><span class="badge order-state order-state-${status}">${order.tier === 'mechanical-test' ? '3MF 測試' : orderStatuses[status]}</span></td></tr>`;
    }).join('')}</tbody></table>` : '<p class="order-empty">沒有符合條件的訂單。</p>';
}

async function loadClickerOrders() {
  const version = ++orderSearchVersion;
  const target = location.hash.startsWith('#orders/') ? detailContent : orderList;
  if (target === detailContent) {
    detailView.hidden = false;
    listView.hidden = true;
  }
  target.textContent = '正在讀取訂單…';
  try {
    const detailId = /^#orders\/(OGS-(?:T|E|P|DEMO)-[A-F0-9]{12})$/.exec(location.hash)?.[1];
    const query = orderSearch.elements.query.value.trim();
    const { items, physicalItems, ecpayStageAvailable, shippingToolsAvailable } = await api('clicker-orders?q=' + encodeURIComponent(detailId || query));
    if (version !== orderSearchVersion || !isOrderRoute()) return;
    orders = [...items, ...(physicalItems || [])].sort((left, right) => (right.createdAt || '').localeCompare(left.createdAt || ''));
    shippingTools = shippingToolsAvailable;
    $('#new-checkout-test').hidden = !shippingTools;
    $('#new-ecpay-test').hidden = !ecpayStageAvailable;
    renderOrderView();
  } catch (error) {
    if (version === orderSearchVersion) target.textContent = error.message;
  }
}

orderNav.onclick = () => {
  if (isOrderRoute() && location.hash.startsWith('#orders/')) location.hash = '#orders';
  else showClickerOrders();
};
window.addEventListener('hashchange', () => {
  if (isOrderRoute()) showClickerOrders();
  else if (!orderView.hidden) showList();
});
orderSearch.onsubmit = event => { event.preventDefault(); loadClickerOrders(); };
$('#order-type-filter').onchange = renderOrderView;
orderList.addEventListener('click', event => {
  const button = event.target.closest('[data-order-sort]');
  if (!button) return;
  const field = button.dataset.orderSort;
  const direction = field === orderSort.field
    ? (orderSort.direction === 'ascending' ? 'descending' : 'ascending')
    : (field === 'date' ? 'descending' : 'ascending');
  orderSort = { field, direction };
  renderOrderView();
  orderList.querySelector(`[data-order-sort="${field}"]`)?.focus({ preventScroll: true });
});
$('#order-status-filters').addEventListener('click', event => {
  const filter = event.target.closest('[data-order-status]');
  if (!filter) return;
  orderStatusFilter = filter.dataset.orderStatus;
  for (const button of $('#order-status-filters').querySelectorAll('button')) {
    button.classList.toggle('active', button === filter);
    button.setAttribute('aria-pressed', String(button === filter));
  }
  renderOrderView();
});
async function logisticsRequest(action, id) {
  const response = await fetch('/api/checkout-logistics-preview/' + action, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }),
  });
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.error || '無法讀取物流測試單。');
  }
  return response;
}

function openStageLabel(tab, { action, fields }) {
  const destination = 'https://logistics-stage.ecpay.com.tw/Express/PrintUniMartC2COrderInfo';
  if (action !== destination) throw new Error('列印網址與綠界測試環境不符。');
  const form = tab.document.createElement('form');
  form.method = 'POST';
  form.action = destination;
  for (const [name, value] of Object.entries(fields)) {
    const input = tab.document.createElement('input');
    Object.assign(input, { type: 'hidden', name, value });
    form.append(input);
  }
  tab.document.body.append(form);
  form.submit();
}

async function shippingAction(button, action, id) {
  const status = button.parentElement.querySelector('[role="status"]');
  const printing = action === 'print' || action === 'print-pending';
  let tab;
  button.disabled = true;
  status.textContent = '正在讀取綠界測試單…';
  try {
    if (printing) {
      tab = window.open('about:blank', '_blank');
      if (!tab) throw new Error('請允許開啟新分頁後重試。');
      tab.opener = null;
      tab.document.body.textContent = '正在開啟綠界測試託運單…';
    }
    const response = logisticsRequest(action === 'download-pending-pdf' ? 'render-pending-labels' : action, id);
    if (action === 'code') {
      const code = response.then(result => result.json()).then(result => result.code);
      let copied=false;
      try {
        await navigator.clipboard.write([new ClipboardItem({ 'text/plain': code.then(value => new Blob([value], {type:'text/plain'})) })]);
        copied=true;
      } catch {}
      const input=document.createElement('input');
      input.value=await code;input.readOnly=true;
      input.setAttribute('aria-label','12 碼交貨便代碼');
      status.replaceChildren(document.createTextNode(copied?'已複製 12 碼交貨便代碼。':'請選取並複製 12 碼交貨便代碼。'),input);
      if(!copied)input.select();
    } else if (printing) {
      openStageLabel(tab, await (await response).json());
      status.textContent = '已開啟綠界測試託運單。';
    } else if (action === 'download-pending-pdf') {
      const [{ downloadShippingPdf }, labels] = await Promise.all([import('/admin-shipping-pdf.js'), response]);
      await downloadShippingPdf(labels);
      status.textContent = '已下載綠界測試託運單 PDF。';
    } else if (action === 'export-pending') {
      const url = URL.createObjectURL(await (await response).blob());
      const link = document.createElement('a');
      link.href = url;
      link.download = 'ogs-7eleven-pending-test.html';
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      status.textContent = '已下載 7-ELEVEN 待寄件清單。';
    } else {
      await response;
      await loadClickerOrders();
    }
  } catch (error) {
    tab?.close();
    status.textContent = error.message;
  } finally {
    button.disabled = false;
  }
}

$('#pending-shipments').addEventListener('click', event => {
  const button = event.target.closest('[data-shipping-batch]');
  if (button) shippingAction(button, button.dataset.shippingBatch);
});
detailContent.addEventListener('click', event => {
  const button = event.target.closest('[data-logistics-action]');
  if (button) shippingAction(button, button.dataset.logisticsAction, button.dataset.orderId);
});
detailContent.addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.target;
  if (!form.reportValidity()) return;
  const button = form.querySelector('button');
  const status = form.querySelector('[role="status"]');
  button.disabled = true;
  try {
    await api('clicker-orders/' + form.dataset.matchOrder + '/match', {
      method: 'PUT',
      body: JSON.stringify({ reference: form.elements.reference.value, amount: Number(form.elements.amount.value) }),
    });
    notify('測試單已配對。');
    await loadClickerOrders();
  } catch (error) {
    status.textContent = error.message;
    button.disabled = false;
  }
});
