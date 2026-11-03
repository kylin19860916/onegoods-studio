import urllib.request,urllib.error,http.cookiejar,json,uuid,os
base=os.environ.get('OGS_TEST_BASE','http://127.0.0.1:4185');assert base.startswith('http://127.0.0.1:')
jar=http.cookiejar.CookieJar();owner=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar));owner.open(base+'/signin-with-chatgpt?return_to=%2Fadmin').read();checks=[]
def req(path,method='GET',data=None):
 r=urllib.request.Request(base+path,data=json.dumps(data).encode() if data is not None else None,method=method,headers={'Origin':base,'Content-Type':'application/json'})
 try:
  with owner.open(r) as s:return s.status,json.loads(s.read())
 except urllib.error.HTTPError as e:return e.code,json.loads(e.read())
def ok(v,label):assert v,label;checks.append(label)
req('/api/admin/initialize','POST',{})
p=req('/api/admin/catalog')[1]['items'][0].copy();p.update(id='channel-test-'+uuid.uuid4().hex[:8],kind='physical',category='press',name='本機平台入口驗收',images=[],fileIds=[],status='published',saleStatus='available',purchaseUrl='',shopeeUrl='https://shopee.tw/product/1/1',keynadeFacts=False)
s,b=req('/api/admin/catalog','POST',p);ok(s==200,'Shopee-only sales supported');p=b['item'];code=p['managementCode']
for url in ['https://shopee.tw.evil.example/product/1/1','javascript:alert(1)','https://example.com/item','https://name:pass@shopee.tw/item']:
 ok(req('/api/admin/catalog/'+p['id'],'PUT',{**p,'shopeeUrl':url})[0]==400,'unsafe platform URL rejected: '+url.split(':')[0]+(' host' if 'evil' in url else ''))
p['purchaseUrl']='https://myship.7-11.com.tw/general/detail/GM2610308808682';s,b=req('/api/admin/catalog/'+p['id'],'PUT',p);ok(s==200,'both platforms saved together');p=b['item'];ok(p['managementCode']==code,'platform links preserve management number')
public=next(x for x in req('/api/catalog')[1]['items'] if x['id']==p['id']);ok(public['purchaseUrl']==p['purchaseUrl'] and public['shopeeUrl']==p['shopeeUrl'],'public catalog exposes both purchase links')
# Keep this local-only published fixture for real browser rendering; never package the local DB.
print(json.dumps({'passed':len(checks),'checks':checks,'local_fixture_id':p['id']},ensure_ascii=False,indent=2))
