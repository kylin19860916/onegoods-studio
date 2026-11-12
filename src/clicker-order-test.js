import { exceedsClickerTextLimit, quoteClickerEcpayStage, quoteClickerTest } from './clicker-test-pricing.js';

const endpoint = '/api/clicker-orders/test';

async function api(url, options) {
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok) throw Object.assign(new Error(data.error), { status: response.status });
  return data;
}

export function setupClickerOrderTest(form, readDesign) {
  const mode = new URLSearchParams(location.search).get('test-order');
  if (mode !== '1' && mode !== 'ecpay') return;
  const ecpay = mode === 'ecpay';
  const apiUrl = ecpay ? endpoint + '?provider=ecpay' : endpoint;
  const quoteDesign = ecpay ? quoteClickerEcpayStage : quoteClickerTest;
  const panel = document.querySelector('#clicker-order-test');
  const price = panel.querySelector('#clicker-order-price');
  const submit = panel.querySelector('button[type="submit"]');
  const status = panel.querySelector('[role="status"]');
  const login = panel.querySelector('#clicker-order-login');
  const controls = panel.querySelector('#clicker-order-controls');
  const name = form.querySelector('#clicker-name-text');
  let pending = null;
  let submitting = false;
  if (ecpay) {
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
    login.href = '/signin-with-chatgpt?return_to=' + encodeURIComponent(location.pathname + location.search);
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
    const quote = quoteDesign(design?.text);
    return quote ? { ...design, text: quote.text } : null;
  }

  function renderQuote() {
    const text = readDesign()?.text;
    const quote = quoteDesign(text);
    price.textContent = quote
      ? ecpay ? 'NT$' + quote.tier.amount : panel.dataset.quote.replace('{tier}', quote.tier.code).replace('{amount}', String(quote.tier.amount))
      : exceedsClickerTextLimit(text) ? '' : panel.dataset.nameRequired;
    submit.disabled = submitting || !quote;
  }

  form.addEventListener('input', renderQuote);
  form.addEventListener('compositionend', renderQuote);
  form.addEventListener('submit', async () => {
    if (controls.hidden || submitting) return;
    const design = configuration();
    if (!design) {
      if (readDesign()) name.focus();
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
