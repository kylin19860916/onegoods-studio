import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
let checks=0;
function setup(locale='zh-Hant'){
 const elements={};
 const ctx=vm.createContext({URLSearchParams,fetch:()=>new Promise(()=>{}),location:{pathname:'/product',search:'?id=test'},document:{documentElement:{lang:locale},body:{dataset:{}},querySelector:s=>elements[s]||null,querySelectorAll:()=>[],addEventListener:()=>{}}});
 vm.runInContext(source,ctx);
 return {ctx,elements,run:s=>vm.runInContext(s,ctx),set:p=>{ctx.fixture=p;vm.runInContext('products=[localize(fixture)]',ctx);}};
}
const blank={id:'test',name:'Test',kind:'physical',category:'press',saleStatus:'coming_soon',price:null,tagline:' ',description:' ',detail:' ',included:' ',images:[],specs:[{label:'material',value:' '},{label:'',value:'PLA'}],translations:{}};
const t=setup();t.elements['#products']={};t.elements['#full-product']={};
t.set(blank);t.run('renderProducts();renderFullProduct()');
for(const label of ['售价未公布','keynade-price','product-meta','<p></p>','keynade-details','keynade-specs']){assert.ok(!(t.elements['#products'].innerHTML+t.elements['#full-product'].innerHTML).includes(label),label);checks++;}
assert.ok(t.elements['#full-product'].innerHTML.includes('尚未开售'));checks++;
for(const price of [null,undefined,'',' ',NaN]){t.ctx.testPrice=price;assert.equal(t.run('priceLabel({price:testPrice})'),'');checks++;}
assert.equal(t.run('priceLabel({price:0})'),'NT$0');checks++;
assert.equal(t.run('paragraphs("  \\n ")'),'');checks++;
const full={...blank,price:499,tagline:'PRESS',description:'Card copy',detail:'Detail copy',included:'Chain',specs:[{label:'Parts',value:'1 chain'}]};
t.set(full);t.run('renderProducts();renderFullProduct()');
for(const text of ['PRESS','Card copy','NT$499']){assert.ok(t.elements['#products'].innerHTML.includes(text));checks++;}
for(const text of ['Detail copy','Chain','Parts','1 chain']){assert.ok(t.elements['#full-product'].innerHTML.includes(text));checks++;}
// Translation fallback preserves entered base content; whitespace is not content.
const en=setup('en');en.set({...full,translations:{en:{tagline:' ',included:'English chain',specs:[]}}});assert.equal(en.run('products[0].en'),'PRESS');checks++;assert.equal(en.run('products[0].included'),'English chain');checks++;
t.elements['#product-detail']={};t.elements['#product-dialog']={showModal(){}};
t.set({...blank,kind:'design',category:'file',version:' ',makerworldUrl:''});t.run('detail("test")');let html=t.elements['#product-detail'].innerHTML;
for(const text of ['href=','使用授权','NT$','photo-slot"><span','<p></p>']){assert.ok(!html.includes(text),text);checks++;}
t.set({...full,kind:'design',category:'file',version:'v1',printingNotes:'Print notes',license:'Personal use',makerworldUrl:'https://makerworld.com/en/models/123'});t.run('detail("test")');html=t.elements['#product-detail'].innerHTML;
for(const text of ['v1','Print notes','Personal use','https://makerworld.com/en/models/123','Chain','Parts']){assert.ok(html.includes(text),text);checks++;}
// Missing photo captions must not visibly substitute the product name.
t.set({...blank,images:[{url:'assets/test.jpg',alt:''}]});t.run('renderFullProduct()');assert.ok(t.elements['#full-product'].innerHTML.includes('id="keynade-caption" hidden></figcaption>'));checks++;
console.log(`${checks} optional-field rendering checks passed`);
