import urllib.request,urllib.error,http.cookiejar,json,uuid
base='http://127.0.0.1:4173'
jar=http.cookiejar.CookieJar();owner=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar));anon=urllib.request.build_opener()
owner.open(base+'/signin-with-chatgpt?return_to=%2Fadmin').read()
checks=[]
def req(path,method='GET',data=None,client=owner,origin=base,raw=None,ct='application/json'):
 body=json.dumps(data).encode() if data is not None else raw
 headers={'Origin':origin}
 if body is not None:headers['Content-Type']=ct
 r=urllib.request.Request(base+path,data=body,method=method,headers=headers)
 try:
  s=client.open(r);return s.status,s.read()
 except urllib.error.HTTPError as e:return e.code,e.read()
def ok(v,label):assert v,label;checks.append(label)
def obj(body):return json.loads(body)
ok(req('/api/admin/catalog',client=anon)[0]==401,'anonymous admin API denied')
ok(req('/api/admin/initialize','POST',{},origin='https://untrusted.example')[0]==403,'cross-origin write denied')
ok(req('/api/admin/initialize','POST',{})[0]==200,'existing catalog initialized idempotently')
p=obj(req('/api/admin/catalog')[1])['items'][0].copy();p.update(id='cms-test-'+uuid.uuid4().hex[:10],name='CMS local test',status='draft',images=[],fileIds=[],internalNotes='PRIVATE_SMOKE_NOTE',saleStatus='coming_soon',keynadeFacts=False)
s,b=req('/api/admin/catalog','POST',p);ok(s==200,'draft created in persistent D1');p=obj(b)['item']
ok(not any(x['id']==p['id'] for x in obj(req('/api/catalog',client=anon)[1])['items']),'draft excluded from public catalog')
p['status']='published';s,b=req('/api/admin/catalog/'+p['id'],'PUT',p);ok(s==200,'publish saved');new=obj(b)['item']
s,b=req('/api/admin/catalog/'+p['id'],'PUT',p);ok(s==409,'stale revision rejected')
p=new;items=obj(req('/api/catalog',client=anon)[1])['items'];public=next(x for x in items if x['id']==p['id']);ok('internalNotes' not in public and 'fileIds' not in public,'private notes and attachment IDs stripped from public response')
bad=p.copy();bad['saleStatus']='available';bad['purchaseUrl']='';ok(req('/api/admin/catalog/'+p['id'],'PUT',bad)[0]==400,'sale requires verified platform URL')
bad=p.copy();bad['price']=-1;ok(req('/api/admin/catalog/'+p['id'],'PUT',bad)[0]==400,'invalid price rejected')
bad=p.copy();bad['category']='file';ok(req('/api/admin/catalog/'+p['id'],'PUT',bad)[0]==400,'physical goods cannot enter digital category')
def upload(content,name,kind,mime):
 boundary='ogstest'+uuid.uuid4().hex
 body=(f'--{boundary}\r\nContent-Disposition: form-data; name="kind"\r\n\r\n{kind}\r\n--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="{name}"\r\nContent-Type: {mime}\r\n\r\n'.encode()+content+f'\r\n--{boundary}--\r\n'.encode())
 return req('/api/admin/upload','POST',raw=body,ct='multipart/form-data; boundary='+boundary)
s,b=upload(open('public/assets/icon.png','rb').read(),'test.png','image','image/png');ok(s==201,'image stored in R2');im=obj(b)
ok(req(im['url'],client=anon)[0]==404,'unattached image is not public')
p['images']=[{'url':im['url'],'alt':'Local test'}];s,b=req('/api/admin/catalog/'+p['id'],'PUT',p);ok(s==200,'uploaded image linked to product');p=obj(b)['item'];ok(req(im['url'],client=anon)[0]==200,'published product image readable')
s,b=upload(b'%PDF-1.4\nLocal test\n','test.pdf','design','application/pdf');ok(s==201,'private design file stored');attachment=obj(b)
ok(req('/api/admin/assets/'+attachment['id'],client=anon)[0]==401,'anonymous design download denied')
ok(req('/media/'+attachment['id'],client=anon)[0]==404,'design file never exposed by image endpoint')
ok(upload(b'<svg/>','test.svg','image','image/svg+xml')[0]==400,'active SVG upload rejected')
p['status']='archived';s,b=req('/api/admin/catalog/'+p['id'],'PUT',p);ok(s==200,'archive saved');ok(not any(x['id']==p['id'] for x in obj(req('/api/catalog',client=anon)[1])['items']),'archived item removed from public catalog');ok(req(im['url'],client=anon)[0]==404,'archived image no longer public')
print(json.dumps({'passed':len(checks),'checks':checks},ensure_ascii=False,indent=2))
