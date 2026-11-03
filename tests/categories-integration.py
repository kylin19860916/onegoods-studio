import urllib.request,urllib.error,http.cookiejar,json,uuid,os
base=os.environ.get('OGS_TEST_BASE','http://127.0.0.1:4183');assert base.startswith('http://127.0.0.1:')
jar=http.cookiejar.CookieJar();owner=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar));anon=urllib.request.build_opener();owner.open(base+'/signin-with-chatgpt?return_to=%2Fadmin').read();checks=[]
def req(path,method='GET',data=None,client=owner,origin=base):
 r=urllib.request.Request(base+path,data=json.dumps(data).encode() if data is not None else None,method=method,headers={'Origin':origin,'Content-Type':'application/json'})
 try:
  with client.open(r) as s:return s.status,json.loads(s.read())
 except urllib.error.HTTPError as e:
  raw=e.read()
  try:return e.code,json.loads(raw)
  except ValueError:return e.code,{}
def ok(v,label):assert v,label;checks.append(label)
req('/api/admin/initialize','POST',{})
ok(req('/api/admin/categories',client=anon)[0]==401,'anonymous category administration denied')
x={'name':'Local category '+uuid.uuid4().hex[:8],'nameEn':'Local custom category','nameZhHans':'本机分类','sortOrder':5,'active':True}
ok(req('/api/admin/categories','POST',x,origin='https://other.example')[0]==403,'cross-origin category write denied')
s,b=req('/api/admin/categories','POST',x);ok(s==200,'custom category created');c=b['item'];cid=c['id']
ok(req('/api/admin/categories','POST',x)[0]==409,'duplicate category name rejected')
s,b=req('/api/admin/categories/'+cid,'PUT',{**c,'name':x['name']+' renamed'});ok(s==200,'category renamed');renamed=b['item']
ok(req('/api/admin/categories/'+cid,'PUT',c)[0]==409,'stale category version rejected');c=renamed
ok(any(y['id']==cid and y['name']==c['name'] for y in req('/api/catalog',client=anon)[1]['categories']),'public category name follows rename')
cats=req('/api/admin/categories')[1]['items'];ok(cats[0]['id']==cid,'category ordering persists')
p=req('/api/admin/catalog')[1]['items'][0].copy();p.update(id='cat-test-'+uuid.uuid4().hex[:8],name='Local category product',category=cid,kind='physical',images=[],fileIds=[],status='published',saleStatus='coming_soon',keynadeFacts=False)
s,b=req('/api/admin/catalog','POST',p);ok(s==200,'product accepts custom category');p=b['item'];code=p['managementCode']
bad={**p,'category':'does-not-exist'};ok(req('/api/admin/catalog/'+p['id'],'PUT',bad)[0]==400,'unknown category rejected')
s,b=req('/api/admin/categories/'+cid,'PUT',{**c,'active':False});ok(s==200,'category disabled');c=b['item']
ok(not any(y['id']==cid for y in req('/api/catalog',client=anon)[1]['categories']),'disabled category omitted from public filters')
ok(any(y['id']==p['id'] for y in req('/api/catalog',client=anon)[1]['items']),'disabling category preserves published products')
s,b=req('/api/admin/catalog/'+p['id'],'PUT',{**p,'name':'Renamed existing product'});ok(s==200,'existing product may keep disabled category');p=b['item'];ok(p['managementCode']==code,'classification changes preserve management code')
bad={**p,'id':'cat-test-'+uuid.uuid4().hex[:8]};ok(req('/api/admin/catalog','POST',bad)[0]==400,'new product cannot use disabled category')
req('/api/admin/initialize','POST',{});ok(not next(y for y in req('/api/admin/categories')[1]['items'] if y['id']==cid)['active'],'initialization does not reactivate disabled category')
s,b=req('/api/admin/categories/'+cid,'PUT',{**c,'active':True});ok(s==200,'category re-enabled');c=b['item']
ok(any(y['id']==cid and y['nameEn']==x['nameEn'] and y['nameZhHans']==x['nameZhHans'] for y in req('/api/catalog',client=anon)[1]['categories']),'re-enabled category and translations visible publicly')
s,b=req('/api/admin/catalog/'+p['id'],'PUT',{**p,'category':'press','status':'archived'});ok(s==200,'product may move to another category without losing record')
req('/api/admin/categories/'+cid,'PUT',{**c,'active':False})
print(json.dumps({'passed':len(checks),'checks':checks},ensure_ascii=False,indent=2))
