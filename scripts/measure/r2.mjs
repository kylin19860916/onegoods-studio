import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const [before, after, directory, fixtureDirectory] = process.argv.slice(2);
if (!fixtureDirectory) throw new Error('Usage: node r2.mjs BEFORE_URL AFTER_URL OUTPUT FIXTURES');
const output = resolve(directory);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROME || undefined,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const names = ['home','products','custom-list','keynade','stir-stick','custom','nameplate','press','articulated','policy'];
const original = {
  home:'/', products:'/products.html', 'custom-list':'/products.html', keynade:'/product.html?id=keynade-mx',
  'stir-stick':'/product.html?id=lucky-stir-stick', custom:'/custom.html', nameplate:'/nameplate.html',
  press:'/nameplate.html?style=name-clicker', articulated:'/nameplate.html?style=name-articulated', policy:'/purchase-policy.html',
};
const updated = { ...original, nameplate:'/custom?type=nameplate', press:'/custom?type=press', articulated:'/custom?type=articulated' };
const results = { screenshots:[], pages:{}, custom:{}, checkout:{} };

async function fixtures(context) {
  for (const [path,file] of [['/api/catalog','catalog.json'],['/api/store-payment/config','config.json']]) {
    const body = await readFile(join(fixtureDirectory,file),'utf8');
    await context.route('**'+path, route => route.fulfill({ contentType:'application/json',body }));
  }
  await context.route('**/media/*', async route => {
    const key = new URL(route.request().url()).pathname.split('/').pop();
    try { await route.fulfill({ path:join(fixtureDirectory,'media',key),contentType:'image/jpeg' }); }
    catch { await route.abort(); }
  });
}
async function prepare(page, route, group, name) {
  await page.goto(route,{waitUntil:'load',timeout:45000});
  if (name === 'custom-list') {
    const tab = page.locator('[data-filter="custom"]');
    if (await tab.isVisible()) await tab.click();
  }
  if (['keynade','stir-stick'].includes(name)) await page.locator('#full-product h1').waitFor();
  if (['products','custom-list'].includes(name)) await page.locator('#products :is(a,button)').first().waitFor({timeout:7000});
  if (group === 'after' && ['nameplate','press','articulated','custom'].includes(name)) await page.locator('[role=tab][aria-selected=true]').waitFor();
  await page.evaluate(async () => {
    await document.fonts.ready;
    const pictures = [...document.querySelectorAll('main img')];
    pictures.forEach(image => { image.loading = 'eager'; });
    await Promise.all(pictures.map(image => image.decode().catch(() => {})));
  });
}
async function measure(page) {
  return page.evaluate(() => {
    const visible = el => el?.getBoundingClientRect().width > 0 && el.getBoundingClientRect().height > 0
      && getComputedStyle(el).visibility !== 'hidden' && getComputedStyle(el).opacity !== '0'
      && !el.closest('[hidden], [aria-hidden="true"], .sr-only')
      && (!el.closest('details:not([open])') || Boolean(el.closest('summary')));
    const bounds = selector => {
      const el = [...document.querySelectorAll(selector)].find(visible);
      const rect = el?.getBoundingClientRect();
      return rect ? { x:Math.round(rect.x), y:Math.round(rect.y), end:Math.round(rect.bottom), height:Math.round(rect.height) } : null;
    };
    const text = [...document.querySelectorAll('main *, header *, footer *')].filter(el => visible(el) &&
      [...el.childNodes].some(node=>node.nodeType === 3 && node.textContent.trim()));
    const smallText = text.filter(el=>Number.parseFloat(getComputedStyle(el).fontSize)<13)
      .map(el=>({ text:el.innerText.trim().slice(0,80), size:getComputedStyle(el).fontSize })).filter(item=>item.text);
    const smallTargets = [...document.querySelectorAll('main a[href], main button, main summary, main input:not([type=radio],[type=checkbox]), main select, header a, header button, footer a')]
      .filter(el=>visible(el) && !el.disabled && (el.getBoundingClientRect().height < 44 || el.getBoundingClientRect().width < 44))
      .map(el=>({text:(el.innerText||el.getAttribute('aria-label')||el.name||el.id).trim().slice(0,80),
        element:el.tagName, id:el.id, class:el.className, size:[Math.round(el.getBoundingClientRect().width),Math.round(el.getBoundingClientRect().height)]}));
    return {
      sectionLefts: [...document.querySelectorAll('header.r2-header, main > .wrap, main .r2-hero-grid, main.section, main > section > .wrap')]
        .filter(visible).map(el=>({ tag:el.tagName, class:el.className, x:Math.round(el.getBoundingClientRect().x+Number.parseFloat(getComputedStyle(el).paddingLeft)) })),
      productPrice:bounds('.keynade-price'), nameInput:bounds('#r2-shared-name, #plate-name, #clicker-name-text'),
      preview:bounds('.keyring-preview-frame'), panel:bounds('.nameplate-form'),
      currentText:document.querySelector('main').innerText, smallText, smallTargets,
      eyebrows:[...document.querySelectorAll('.eyebrow')].filter(visible).length,
      stages:[...document.querySelectorAll('.r2-stage')].filter(visible).length,
      openingSoon:(document.querySelector('main').innerText.match(/開通中|开通中/g)||[]).length,
      footer:document.querySelector('.footer-contact')?.innerText,
      footerFont:document.querySelector('.footer-contact p') ? getComputedStyle(document.querySelector('.footer-contact p')).fontSize : null,
      buying:[...document.querySelectorAll('a[href*="checkout"], a.platform-purchase')].filter(visible).map(a=>a.getAttribute('href')).sort(),
      overflow:document.documentElement.scrollWidth-innerWidth,
    };
  });
}

try {
  for (const [group,origin,routes] of [['before',before,original],['after',after,updated]]) {
    if (process.env.OGS_MEASURE_GROUP && process.env.OGS_MEASURE_GROUP !== group) continue;
    for (const [locale, widths, pages] of [['zh-Hant',[1440,390],names],['en',[1440,390],['home','keynade']],['zh-Hans',[1440,390],['home','keynade']]]) {
      const prefix = locale === 'en' ? '/en' : locale === 'zh-Hans' ? '/zh-cn' : '';
      for (const width of widths) {
        const context = await browser.newContext({ viewport:{width,height:width===1440?900:844},deviceScaleFactor:1,reducedMotion:'reduce' });
        await fixtures(context);
        const page = await context.newPage();
        for (const name of pages) {
          const key = [group,locale,width,name].join('-');
          const errors = [];
          const onError = error => errors.push(error.message);
          page.on('pageerror',onError);
          try {
            await prepare(page,origin+prefix+routes[name],group,name);
            if (['nameplate','articulated','press','custom'].includes(name)) await page.waitForTimeout(850);
            for (const fullPage of [false,true]) {
              const file = key + (fullPage ? '-full' : '-fold') + '.png';
              await page.screenshot({path:join(output,file),fullPage,animations:'disabled',timeout:45000});
              results.screenshots.push(file);
            }
            results.pages[key] = { ...await measure(page), errors };
          } catch(error) {
            results.pages[key] = { error:String(error),errors };
          } finally { page.off('pageerror',onError); }
        }
        await context.close();
      }
    }
  }
  const context = await browser.newContext({ viewport:{width:390,height:844},reducedMotion:'reduce' });
  await fixtures(context);
  await context.route(/\/nameplate\.js\?v=/,async route => {
    const response = await route.fetch();
    const script = await response.text();
    // Keep the instrumentation in the test browser. Observe renderer.info without modifying production builds.
    const trace = script.replace(/([A-Za-z_$][\w$]*)\.info=([A-Za-z_$][\w$]*)\}/,
      '$1.info=$2,(globalThis.__ogsMeasure??=[]).push(new WeakRef($1))}');
    await route.fulfill({response,body:trace});
  });
  const page = await context.newPage();
  await page.goto(after+'/nameplate.html?style=name-articulated&name=LEO');
  await page.waitForURL(/custom\?.*type=articulated/);
  const input = page.locator('#r2-shared-name');
  results.custom.redirect = { url:page.url(), name:await input.inputValue() };
  for (const [type,dimension] of [['nameplate','#keyring-dimensions'],['press','#clicker-dimensions'],['articulated','#keyring-dimensions']]) {
    await page.locator('#r2-tab-'+type).click();
    results.custom[type] = [];
    for (const name of ['陳怡君','Alexander','ABCDEFGHIJKL']) {
      await input.fill(name);
      await page.waitForTimeout(500);
      results.custom[type].push({name,input:await input.inputValue(),dimensions:await page.locator(dimension).textContent(),
        status:await page.locator(type==='press'?'#clicker-name-limit-error':'#plate-preview-status').isVisible(),
        overflow:await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)});
    }
  }
  await input.fill('');
  results.custom.articulatedPrices = [await page.locator('#articulated-price output').evaluate(node=>node.value)];
  await input.fill('LEO');
  results.custom.articulatedPrices.push(await page.locator('#articulated-price output').evaluate(node=>node.value));
  const cdp = await context.newCDPSession(page);
  const heap = async () => {
    await cdp.send('HeapProfiler.collectGarbage');
    return (await cdp.send('Runtime.getHeapUsage')).usedSize;
  };
  for (const type of ['nameplate','press','articulated']) await page.locator('#r2-tab-'+type).click();
  await page.waitForTimeout(750);
  results.custom.heapBefore = await heap();
  results.custom.geometryCounts = [];
  for (let index=0;index<20;index++) {
    const type=['nameplate','press','articulated'][index%3];
    await page.locator('#r2-tab-'+type).click();
    await page.waitForTimeout(300);
    await heap();
    results.custom.geometryCounts.push({
      type,
      live:await page.evaluate(()=>globalThis.__ogsMeasure?.map(ref=>ref.deref()?.info.memory.geometries).filter(value=>value!==undefined) ?? []),
    });
  }
  await page.waitForTimeout(750);
  results.custom.heapAfter = await heap();
  results.custom.visibleCanvases = await page.locator('canvas:visible').count();
  for (const [style, type] of [['name-tag','nameplate'],['name-clicker','press'],['name-articulated','articulated']]) {
    await page.goto(after+'/nameplate.html?style='+style+'&name=LEO');
    await page.waitForURL('**/custom?name=LEO&type='+type);
    results.custom.redirect[type] = await input.inputValue();
  }
  await context.route('**/api/store-payment/checkout',route=>route.abort());
  await page.goto(after+'/checkout.html?product=keynade-mx&qty=3');
  await page.locator('#store-to-shipping').click();
  results.checkout.quantity = await page.locator('#store-quantity').inputValue();
  results.checkout.options = await page.locator('#store-delivery option').allTextContents();
  results.checkout.address = await page.locator('#store-city').isVisible();
  await page.locator('#store-delivery').selectOption('pickup');
  results.checkout.storeSearch = await page.locator('#store-branch-query').isVisible();
  await page.goto(after+'/custom?type=press&name=LEO');
  await page.locator('#connected-order-start').click();
  await page.waitForURL('**/checkout.html?custom=connected-name-clicker');
  results.checkout.custom = await page.locator('#store-custom-design').innerText();
} finally {
  await browser.close();
  await writeFile(join(output,'measurements.json'),JSON.stringify(results,null,2)+'\n');
}
