import seed from './catalog-seed.json';
const defaultCategories=[
 {id:'press',name:'按壓派',nameEn:'Press & relax',nameZhHans:'按压派',sortOrder:10,active:true},
 {id:'spin',name:'旋轉派',nameEn:'Spin & unwind',nameZhHans:'旋转派',sortOrder:20,active:true},
 {id:'other',name:'其他小物',nameEn:'Other little goods',nameZhHans:'其他小物',sortOrder:30,active:true},
];
const categoryFromRow=(r:any)=>({id:r.id,name:r.name,nameEn:r.name_en,nameZhHans:r.name_zh_hans,sortOrder:r.sort_order,active:!!r.active,revision:r.revision,updatedAt:r.updated_at});
async function allCategories(env:any){const rows=(await env.DB.prepare('SELECT * FROM catalog_categories ORDER BY sort_order,id').all()).results||[];return rows.map(categoryFromRow);}
const noCache={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
export function json(value:unknown,status=200){return Response.json(value,{status,headers:noCache});}
export function isAdmin(user:any,env:any){
 const allowed=String(env.OGS_ADMIN_EMAILS||'').toLowerCase().split(',').map(s=>s.trim()).filter(Boolean);
 return !!user && (allowed.includes(user.email.toLowerCase()) || (import.meta.env.DEV && user.email==='seedy@sites.test'));
}
export class HttpError extends Error {constructor(public status:number,message:string){super(message)}}
function check(ok:any,message:string){if(!ok)throw new HttpError(400,message)}
const text=(v:any,max=10000)=>typeof v==='string'?v.trim().slice(0,max):'';
function safeLink(v:any,hosts?:string[]){const s=text(v,2048);if(!s)return '';let u;try{u=new URL(s)}catch{throw new HttpError(400,'連結必須是完整 HTTPS 網址。')}check(u.protocol==='https:'&&!u.username&&!u.password,'僅接受 HTTPS 連結。');if(hosts)check(hosts.includes(u.hostname),'請使用對應平台的官方網址。');return u.href;}
export function validateProduct(input:any){
 check(input && typeof input==='object'&&!Array.isArray(input),'商品資料格式不正確。');
 const id=text(input.id,80);check(/^[a-z0-9][a-z0-9-]{0,79}$/.test(id),'商品代號請用小寫英文字母、數字及連字號。');
 check(['physical','design'].includes(input.kind),'請選擇商品類型。');
 check(['draft','published','archived'].includes(input.status),'商品狀態不正確。');
 const name=text(input.name,150);check(name,'請填寫商品名稱。');
 const price=input.price===null||input.price===''||input.price===undefined?null:Number(input.price);check(price===null||(Number.isFinite(price)&&price>=0&&price<=10000000),'價格必須是有效的非負數。');
 const category=input.kind==='design'?'file':input.category;check(input.kind==='design'||(typeof category==='string'&&/^[a-z0-9][a-z0-9-]{0,79}$/.test(category)&&category!=='file'),'請選擇正確的實體商品分類。');
 check(Array.isArray(input.images)&&input.images.length<=12,'圖片最多12張。');
 const images=input.images.map((im:any)=>{const url=text(im.url,2048);check(/^\/media\/[a-f0-9-]+$/.test(url)||/^\/?assets\/[a-zA-Z0-9_/.\-]+$/.test(url)||/^https:\/\//.test(url),'圖片網址不正確。');check(!url.includes('..'),'圖片路徑不正確。');if(url.startsWith('https:'))safeLink(url);return {url,alt:text(im.alt,250)};});
 const purchaseUrl=safeLink(input.purchaseUrl,['myship.7-11.com.tw']);
 const shopeeUrl=safeLink(input.shopeeUrl,['shopee.tw','www.shopee.tw','s.shopee.tw','tw.shp.ee']);
 const makerworldUrl=safeLink(input.makerworldUrl,['makerworld.com','www.makerworld.com']);
 check(['coming_soon','available'].includes(input.saleStatus),'銷售狀態不正確。');
 if(input.saleStatus==='available')check(input.kind==='physical'?(purchaseUrl||shopeeUrl):makerworldUrl,'開售前請填寫對應的下單或設計頁連結。');
 const specs=Array.isArray(input.specs)?input.specs.slice(0,30).map((s:any)=>({label:text(s.label,100),value:text(s.value,1000)})).filter((s:any)=>s.label&&s.value):[];
 const translations:any={};for(const locale of ['en','zh-Hans']){const t=input.translations?.[locale]||{};translations[locale]={name:text(t.name,150),description:text(t.description,2000),detail:text(t.detail,15000),tagline:text(t.tagline,150),included:text(t.included,3000),license:text(t.license,3000),printingNotes:text(t.printingNotes,5000),specs:Array.isArray(t.specs)?t.specs.slice(0,30).map((s:any)=>({label:text(s.label,100),value:text(s.value,1000)})).filter((s:any)=>s.label&&s.value):[]};}
 const fileIds=Array.isArray(input.fileIds)?input.fileIds.filter((x:any)=>typeof x==='string'&&/^[a-f0-9-]{36}$/.test(x)).slice(0,30):[];
 return {id,kind:input.kind,status:input.status,name,category,price,description:text(input.description,2000),detail:text(input.detail,15000),tagline:text(input.tagline,150),
  color:/^#[0-9a-fA-F]{6}$/.test(input.color)?input.color:'#eee8f4',images,specs,translations,fileIds,purchaseUrl,shopeeUrl,makerworldUrl,
  saleStatus:input.saleStatus,version:text(input.version,100),license:text(input.license,3000),printingNotes:text(input.printingNotes,5000),included:text(input.included,3000),
  internalNotes:text(input.internalNotes,5000),sortOrder:Math.max(0,Math.min(99999,Math.round(Number(input.sortOrder)||0))),isPlaceholder:input.isPlaceholder===true,
  keynadeFacts:input.id==='keynade-mx'?input.keynadeFacts===true:false};
}
function parse(row:any){return {...JSON.parse(row.data),status:row.status,revision:row.revision,updatedAt:row.updated_at,managementCode:row.management_number?'OGS-'+String(row.management_number).padStart(6,'0'):null};}
function publicItem(p:any){const {internalNotes,fileIds,revision,managementCode,...safe}=p;return safe;}
async function allRows(env:any){return (await env.DB.prepare('SELECT catalog.*, catalog_codes.number AS management_number FROM catalog LEFT JOIN catalog_codes ON catalog_codes.product_id=catalog.id ORDER BY json_extract(data, \'$.sortOrder\'), catalog.id').all()).results||[];}
function enforceWrite(request:Request){const origin=request.headers.get('Origin');if(origin!==new URL(request.url).origin)throw new HttpError(403,'請在本網站內操作。');const t=request.headers.get('content-type')||'';check(t.startsWith('application/json')||t.startsWith('multipart/form-data'),'不支援的資料格式。');}
const imageTypes=new Map([['image/jpeg','jpg'],['image/png','png'],['image/webp','webp']]);
export function detectImage(b:Uint8Array){if(b[0]===0xff&&b[1]===0xd8&&b[2]===0xff)return'image/jpeg';if([137,80,78,71,13,10,26,10].every((v,i)=>b[i]===v))return'image/png';if(String.fromCharCode(...b.slice(0,4))==='RIFF'&&String.fromCharCode(...b.slice(8,12))==='WEBP')return'image/webp';return null;}
export async function catalogApi(request:Request,env:any,user:any){try{
 const url=new URL(request.url),path=url.pathname;
 if(path==='/api/catalog'&&request.method==='GET'){
  const rows=await allRows(env);const items=rows.length?rows.map(parse).filter((p:any)=>p.status==='published'):seed;
  const stored=await allCategories(env);const categories=(stored.length?stored:defaultCategories).filter((c:any)=>c.active);return json({items:items.map(publicItem),categories:categories.map(({id,name,nameEn,nameZhHans,sortOrder}:any)=>({id,name,nameEn,nameZhHans,sortOrder}))});
 }
 if(!path.startsWith('/api/admin/'))return json({error:'找不到此功能。'},404);
 if(!user)return json({error:'請先登入。',signIn:'/signin-with-chatgpt?return_to=%2Fadmin'},401);
 if(!isAdmin(user,env))return json({error:'此帳號沒有管理權限。'},403);
 if(request.method!=='GET')enforceWrite(request);
 if(path==='/api/admin/session')return json({name:user.displayName,email:user.email});
 if(path==='/api/admin/initialize'&&request.method==='POST'){
  const statements=seed.map(p=>env.DB.prepare('INSERT OR IGNORE INTO catalog (id,kind,status,data,revision,updated_at) VALUES (?,?,?,?,1,?)').bind(p.id,p.kind,p.status,JSON.stringify(p),new Date().toISOString()));
  // Idempotent backfill outside schema migrations; never rewrite product content.
  statements.push(env.DB.prepare('INSERT INTO catalog_codes (product_id) SELECT id FROM catalog WHERE NOT EXISTS (SELECT 1 FROM catalog_codes WHERE product_id=catalog.id) ORDER BY rowid'));
  for(const c of defaultCategories)statements.push(env.DB.prepare('INSERT OR IGNORE INTO catalog_categories (id,name,name_en,name_zh_hans,sort_order,active,revision,updated_at) VALUES (?,?,?,?,?,1,1,?)').bind(c.id,c.name,c.nameEn,c.nameZhHans,c.sortOrder,new Date().toISOString()));
  await env.DB.batch(statements);return json({ok:true});
 }
 if(path==='/api/admin/catalog'&&request.method==='GET')return json({items:(await allRows(env)).map(parse)});
 if(path==='/api/admin/categories'&&request.method==='GET')return json({items:await allCategories(env)});
 const categoryMatch=path.match(/^\/api\/admin\/categories(?:\/([a-z0-9-]+))?$/);
 if(categoryMatch&&((request.method==='POST'&&!categoryMatch[1])||(request.method==='PUT'&&categoryMatch[1]))){
  const body:any=await request.json();const name=text(body.name,80),nameEn=text(body.nameEn,100),nameZhHans=text(body.nameZhHans,80);
  check(name,'請填寫分類名稱。');check(typeof body.active==='boolean','請選擇分類狀態。');
  const sortOrder=Number(body.sortOrder);check(Number.isInteger(sortOrder)&&sortOrder>=0&&sortOrder<=99999,'排列順序請填0到99999的整數。');
  const id=categoryMatch[1]||'cat-'+crypto.randomUUID(),stamp=new Date().toISOString();
  // The conditional write rejects duplicate normalized names atomically, including concurrent requests.
  const conflictId=categoryMatch[1]||'';
  const duplicate=await env.DB.prepare('SELECT id FROM catalog_categories WHERE id<>? AND name=? COLLATE NOCASE').bind(conflictId,name.normalize('NFKC')).first();
  if(duplicate)throw new HttpError(409,'已有同名分類，請使用不同名稱。');
  if(request.method==='POST'){
   const result=await env.DB.prepare('INSERT INTO catalog_categories (id,name,name_en,name_zh_hans,sort_order,active,revision,updated_at) SELECT ?,?,?,?,?,?,1,? WHERE NOT EXISTS (SELECT 1 FROM catalog_categories WHERE name=? COLLATE NOCASE)').bind(id,name.normalize('NFKC'),nameEn,nameZhHans,sortOrder,body.active?1:0,stamp,name.normalize('NFKC')).run();
   if(!result.meta.changes)throw new HttpError(409,'已有同名分類，請使用不同名稱。');
  }else{
   check(Number.isInteger(body.revision)&&body.revision>0,'版本不正確，請重新讀取分類。');
   const result=await env.DB.prepare('UPDATE catalog_categories SET name=?,name_en=?,name_zh_hans=?,sort_order=?,active=?,revision=revision+1,updated_at=? WHERE id=? AND revision=? AND NOT EXISTS (SELECT 1 FROM catalog_categories WHERE id<>? AND name=? COLLATE NOCASE)').bind(name.normalize('NFKC'),nameEn,nameZhHans,sortOrder,body.active?1:0,stamp,id,body.revision,id,name.normalize('NFKC')).run();
   if(!result.meta.changes)throw new HttpError(409,'分類已在其他視窗更新，或名稱重複。請重新載入後再試。');
  }
  return json({item:categoryFromRow(await env.DB.prepare('SELECT * FROM catalog_categories WHERE id=?').bind(id).first())});
 }
 if(path==='/api/admin/assets'&&request.method==='GET')return json({items:(await env.DB.prepare('SELECT * FROM catalog_assets ORDER BY created_at DESC').all()).results||[]});
 if(path==='/api/admin/upload'&&request.method==='POST'){
  if(Number(request.headers.get('Content-Length'))>32*1024*1024)throw new HttpError(413,'單次上傳請小於30MB。');
  const form=await request.formData();const file=form.get('file');const kind=form.get('kind');
  check(file instanceof File && ['image','design'].includes(String(kind)),'請選擇圖片或設計檔案。');const f=file as File;
  const limit=kind==='image'?10*1024*1024:30*1024*1024;if(f.size>limit)throw new HttpError(413,kind==='image'?'圖片請小於10MB。':'設計檔案請小於30MB。');check(f.size>0,'檔案不可為空。');
  const bytes=new Uint8Array(await f.arrayBuffer());const ext=f.name.split('.').pop()?.toLowerCase();let mime='application/octet-stream';
  if(kind==='image'){const detected=detectImage(bytes);check(detected,'圖片僅接受JPEG、PNG、WebP。');mime=detected!;}
  else {check(['stl','3mf','pdf','zip','step','stp','obj'].includes(ext||''),'設計檔案接受STL、3MF、PDF、ZIP、STEP、STP、OBJ。');if(ext==='pdf')mime='application/pdf';}
  const id=crypto.randomUUID(),name=f.name.replace(/[\r\n"\\/]/g,'_').slice(0,200),createdAt=new Date().toISOString();
  await env.BUCKET.put('catalog/'+id,bytes,{httpMetadata:{contentType:mime}});
  try{await env.DB.prepare('INSERT INTO catalog_assets (id,kind,name,mime,size,created_at) VALUES (?,?,?,?,?,?)').bind(id,kind,name,mime,f.size,createdAt).run();}catch(e){await env.BUCKET.delete('catalog/'+id);throw e;}
  return json({id,name,kind,mime,size:f.size,url:kind==='image'?'/media/'+id:null},201);
 }
 const assetMatch=path.match(/^\/api\/admin\/assets\/([a-f0-9-]{36})$/);if(assetMatch&&request.method==='GET')return serveAsset(env,assetMatch[1],true);
 const match=path.match(/^\/api\/admin\/catalog(?:\/([a-z0-9-]+))?$/);
 if(match&&(request.method==='POST'||request.method==='PUT')){
  const body:any=await request.json();const p=validateProduct(body);check(!match[1]||match[1]===p.id,'商品代號不一致。');
  for(const id of p.fileIds){const a=await env.DB.prepare('SELECT kind FROM catalog_assets WHERE id=?').bind(id).first();check(a?.kind==='design','附件不存在，請重新選擇。');}
  for(const im of p.images){if(im.url.startsWith('/media/')){const a=await env.DB.prepare('SELECT kind FROM catalog_assets WHERE id=?').bind(im.url.slice(7)).first();check(a?.kind==='image','圖片不存在，請重新上傳。');}}
  if(p.kind==='physical'){
   const category=await env.DB.prepare('SELECT active FROM catalog_categories WHERE id=?').bind(p.category).first();
   check(category,'這個分類不存在，請重新選擇。');
   if(!category.active){const current=request.method==='PUT'?await env.DB.prepare('SELECT kind,data FROM catalog WHERE id=?').bind(p.id).first():null;check(current?.kind==='physical'&&JSON.parse(current.data).category===p.category,'這個分類已停用，請選擇啟用中的分類。');}
  }
  const stamp=new Date().toISOString();
  if(request.method==='POST'){
   const old=await env.DB.prepare('SELECT id FROM catalog WHERE id=?').bind(p.id).first();if(old)throw new HttpError(409,'這個商品代號已使用，請換一個。');
   await env.DB.batch([
    env.DB.prepare('INSERT INTO catalog (id,kind,status,data,revision,updated_at) VALUES (?,?,?,?,1,?)').bind(p.id,p.kind,p.status,JSON.stringify(p),stamp),
    env.DB.prepare('INSERT INTO catalog_codes (product_id) VALUES (?)').bind(p.id)
   ]);
  }else{
   check(Number.isInteger(body.revision)&&body.revision>0,'版本不正確，請重新讀取商品。');
   const result=await env.DB.prepare('UPDATE catalog SET kind=?,status=?,data=?,revision=revision+1,updated_at=? WHERE id=? AND revision=?').bind(p.kind,p.status,JSON.stringify(p),stamp,p.id,body.revision).run();
   if(!result.meta.changes)throw new HttpError(409,'資料已被另一個視窗更新。請重新載入後再修改。');
  }
  const updated=await env.DB.prepare('SELECT catalog.*, catalog_codes.number AS management_number FROM catalog LEFT JOIN catalog_codes ON catalog_codes.product_id=catalog.id WHERE catalog.id=?').bind(p.id).first();return json({item:parse(updated)});
 }
 return json({error:'找不到此功能。'},404);
 }catch(error){if(error instanceof HttpError)return json({error:error.message},error.status);console.error('Catalog request failed',error instanceof Error?error.message:'unknown');return json({error:'暫時無法完成操作，請稍後重試。'},500);}}
async function serveAsset(env:any,id:string,privateAccess:boolean){
 const meta=await env.DB.prepare('SELECT * FROM catalog_assets WHERE id=?').bind(id).first();if(!meta)return json({error:'找不到檔案。'},404);
 if(!privateAccess){if(meta.kind!=='image')return json({error:'找不到檔案。'},404);const published=(await env.DB.prepare("SELECT data FROM catalog WHERE status='published'").all()).results||[];if(!published.some((r:any)=>JSON.parse(r.data).images?.some((im:any)=>im.url==='/media/'+id)))return json({error:'找不到圖片。'},404);}
 const file=await env.BUCKET.get('catalog/'+id);if(!file)return json({error:'找不到檔案。'},404);
 return new Response(file.body,{headers:{...noCache,'Content-Type':meta.mime,'Content-Disposition':`${meta.kind==='image'?'inline':'attachment'}; filename*=UTF-8''${encodeURIComponent(meta.name)}`}});
}
export async function mediaApi(id:string,env:any,user:any){return serveAsset(env,id,isAdmin(user,env));}
