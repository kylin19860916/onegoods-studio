import { exceedsClickerTextLimit, quoteClickerTest } from './clicker-test-pricing.js';

const endpoint = '/api/clicker-orders/test';

async function api(options) {
  const response = await fetch(endpoint, options);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
}

export function setupClickerOrderTest(form, readDesign) {
  if (new URLSearchParams(location.search).get('test-order') !== '1') return;
  const panel = document.querySelector('#clicker-order-test');
  const price = panel.querySelector('#clicker-order-price');
  const submit = panel.querySelector('button[type="submit"]');
  const status = panel.querySelector('[role="status"]');
  const login = panel.querySelector('#clicker-order-login');
  const controls = panel.querySelector('#clicker-order-controls');
  const name = form.querySelector('#clicker-name-text');
  let pending = null;
  let submitting = false;
  panel.hidden = false;
  api().then(() => {
    controls.hidden = false;
    renderQuote();
  }).catch(error => {
    status.textContent = error.message;
    login.hidden = false;
  });

  function configuration() {
    const design = readDesign();
    const quote = quoteClickerTest(design?.text);
    return quote ? { ...design, text: quote.text } : null;
  }

  function renderQuote() {
    const text = readDesign()?.text;
    const quote = quoteClickerTest(text);
    price.textContent = quote
      ? panel.dataset.quote.replace('{tier}', quote.tier.code).replace('{amount}', String(quote.tier.amount))
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
      const order = await api({
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
