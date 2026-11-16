import { exceedsClickerTextLimit, quoteClickerEcpayStage, quoteClickerTest } from './clicker-test-pricing.js';

const endpoint = '/api/clicker-orders/test';

async function api(url, options) {
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok) throw Object.assign(new Error(data.error), { status: response.status });
  return data;
}

export function setupClickerOrderTest(form, readDesign) {
  const params = new URLSearchParams(location.search);
  const mode = params.get('test-order');
  const preview = params.get('order-preview') === '1';
  if (!preview && mode !== '1' && mode !== 'ecpay') return;
  const ecpay = mode === 'ecpay';
  const apiUrl = ecpay ? endpoint + '?provider=ecpay' : endpoint;
  const quoteDesign = (preview || ecpay) ? quoteClickerEcpayStage : quoteClickerTest;
  const panel = document.querySelector('#clicker-order-test');
  const price = panel.querySelector('#clicker-order-price');
  const submit = panel.querySelector('button[type="submit"]');
  const status = panel.querySelector('[role="status"]');
  const login = panel.querySelector('#clicker-order-login');
  const controls = panel.querySelector('#clicker-order-controls');
  const name = form.querySelector('#clicker-name-text');
  const submitLabel = submit.textContent;
  const pricingHint = controls.querySelector('p');
  const mechanicalTest = !preview && !ecpay;
  login.href = '/signin-with-chatgpt?return_to=' + encodeURIComponent(location.pathname + location.search);
  let pending = null;
  let submitting = false;
  if (preview) {
    panel.querySelector('h3').textContent = '商品金額';
    panel.querySelector('p').hidden = true;
    controls.querySelector('p').hidden = true;
    submit.textContent = '前往下單';
    form.elements.clickerStyle.value = 'name';
    document.querySelectorAll('#name-clicker .plate-view-hint, #name-clicker figcaption, #clicker-form .eyebrow, [data-keyring-intro="name-clicker"] p').forEach(node => node.hidden = true);
  } else if (ecpay) {
    const locale = document.documentElement.lang;
    const copy = locale.startsWith('en')
      ? ['ECPay test checkout', 'Sandbox only · No charge or shipment', 'Confirm design and go to ECPay test checkout']
      : locale === 'zh-Hans'
        ? ['绿界测试付款', '仅供测试，不会扣款或出货。', '确认设计并前往绿界测试付款']
        : ['綠界測試付款', '僅供測試，不會扣款或出貨。', '確認設計並前往綠界測試付款'];
    panel.querySelector('h3').textContent = copy[0];
    panel.querySelector('p').textContent = copy[1];
    submit.textContent = copy[2];
    controls.querySelector('p').hidden = true;

  }
  panel.hidden = false;
  api(apiUrl).then(() => {
    controls.hidden = false;
    if (ecpay) {
      form.elements.clickerStyle.value = 'name';
      form.dispatchEvent(new Event('input', { bubbles: true }));
    }
    renderQuote();
  }).catch(error => {
    status.textContent = error.message;
    login.hidden = error.status !== 401;
  });

  function configuration() {
    const design = readDesign();
    if (design?.style === 'mechanical') return mechanicalTest ? design : null;
    const quote = quoteDesign(design?.text);
    return quote ? { ...design, text: quote.text } : null;
  }

  function renderQuote() {
    const design = readDesign();
    const mechanical = mechanicalTest && design?.style === 'mechanical';
    if (mechanicalTest) {
      pricingHint.hidden = mechanical;
      submit.textContent = mechanical ? panel.dataset.mechanicalSubmit : submitLabel;
    }
    if (mechanical) {
      price.textContent = panel.dataset.mechanicalReady.replace('{count}', String(design.keys.length));
      submit.disabled = submitting;
      return;
    }
    const text = design?.style === 'mechanical' ? undefined : design?.text;
    const quote = quoteDesign(text);
    price.textContent = quote
      ? (preview || ecpay) ? 'NT$' + quote.tier.amount : panel.dataset.quote.replace('{tier}', quote.tier.code).replace('{amount}', String(quote.tier.amount))
      : exceedsClickerTextLimit(text) ? '' : panel.dataset.nameRequired;
    submit.disabled = submitting || !quote;
  }

  form.addEventListener('input', renderQuote);
  form.addEventListener('clicker-key-count', renderQuote);
  form.addEventListener('compositionend', renderQuote);
  form.addEventListener('submit', async () => {
    if (controls.hidden || submitting) return;
    const design = configuration();
    if (!design) {
      if (readDesign()) name.focus();
      return;
    }
    if (preview) {
      const item = { kind: 'custom', name: '連字按壓款', price: quoteDesign(design.text).tier.amount, design,
        fontName: form.elements.clickerNameFont.selectedOptions[0].textContent.trim(), quantity: 1 };
      sessionStorage.setItem('ogs-order-preview', JSON.stringify({ ...item, submitted: false }));
      location.assign('/internal-checkout.html?preview=1');
      return;
    }
    const snapshot = JSON.stringify(design);
    if (pending?.snapshot !== snapshot) pending = { snapshot, requestId: crypto.randomUUID() };
    submitting = true;
    renderQuote();
    status.textContent = panel.dataset.generating;
    try {
      const order = await api(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...design, requestId: pending.requestId }),
      });
      if (snapshot === JSON.stringify(configuration())) {
        location.assign(order.checkoutUrl);
        return;
      }
      status.textContent = panel.dataset.changed;
    } catch (error) {
      status.textContent = error.message;
    } finally {
      submitting = false;
      renderQuote();
    }
  });
}
