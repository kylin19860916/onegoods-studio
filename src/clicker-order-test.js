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
  const tier = panel.querySelector('#clicker-order-tier');
  const submit = panel.querySelector('button[type="submit"]');
  const receipt = panel.querySelector('#clicker-order-receipt');
  const status = panel.querySelector('[role="status"]');
  const code = receipt.querySelector('output');
  const login = panel.querySelector('#clicker-order-login');
  const controls = panel.querySelector('#clicker-order-controls');
  const checkout = receipt.querySelector('a');
  let pending = null;
  let submitting = false;
  panel.hidden = false;
  api().then(({ tiers }) => {
    tier.replaceChildren(...tiers.map(option => new Option(`${option.label} · NT$${option.amount}`, option.id)));
    controls.hidden = false;
  }).catch(error => {
    status.textContent = error.message;
    login.hidden = false;
  });

  const configuration = () => ({ ...readDesign(), tier: tier.value });
  form.addEventListener('input', () => {
    if (pending?.snapshot !== JSON.stringify(configuration())) receipt.hidden = true;
  });
  form.addEventListener('submit', async () => {
    if (controls.hidden || submitting) return;
    const design = configuration();
    if (!design.text.trim()) {
      status.textContent = panel.dataset.nameRequired;
      form.querySelector('#clicker-name-text').focus();
      return;
    }
    const snapshot = JSON.stringify(design);
    if (pending?.snapshot !== snapshot) pending = { snapshot, requestId: crypto.randomUUID() };
    submitting = true;
    submit.disabled = true;
    status.textContent = panel.dataset.generating;
    try {
      const order = await api({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...design, requestId: pending.requestId }),
      });
      if (snapshot === JSON.stringify(configuration())) {
        code.textContent = order.id;
        receipt.querySelector('[data-order-amount]').textContent = 'NT$' + order.amount;
        checkout.href = order.checkoutUrl;
        receipt.hidden = false;
        receipt.querySelector('h4').focus();
      }
      status.textContent = '';
    } catch (error) {
      status.textContent = error.message;
    } finally {
      submitting = false;
      submit.disabled = false;
    }
  });

  receipt.querySelector('button').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(code.textContent);
      status.textContent = panel.dataset.copied;
    } catch {
      status.textContent = panel.dataset.copyFallback;
    }
  });
}
