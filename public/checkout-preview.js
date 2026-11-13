import { previewShipping as methods } from './checkout-preview-shipping.js';

const isPreview = new URLSearchParams(location.search).get('preview') === '1';

if (!isPreview) {
  location.replace('products.html');
} else {
  const el = id => document.getElementById(id);
  const params = new URLSearchParams(location.search);
  const response = await fetch('/api/admin/session', { cache: 'no-store' });
  if (!response.ok) {
    if (response.status === 401) location.replace('/signin-with-chatgpt?return_to=' + encodeURIComponent(location.pathname + location.search));
    else { const main = document.querySelector('main'); main.hidden = false; main.textContent = '這個結帳入口僅供 OGS 管理員測試。'; }
  } else {
    const productId = params.get('product');
    const ecpay = params.get('payment') === 'ecpay' || (params.has('store') && sessionStorage.getItem('ogs-checkout-provider') === 'ecpay');
    let productDraft;
    if (productId) {
      const catalog = await fetch('/api/catalog', { cache: 'no-store' }).then(response => response.json());
      const item = catalog.items.find(item => item.id === productId && item.kind === 'physical' && !item.isPlaceholder && item.saleStatus === 'available');
      if (item) {
        const image = item.images?.[0]?.url;
        productDraft = { id: item.id, kind: 'physical', name: item.name, price: item.price, quantity: 1,
          image: image?.startsWith('assets/') ? '/' + image : image };
      }
    }
    const draft = params.get('sample') === 'clicker' ? {
      kind: 'custom', name: '連字按壓款', price: 410, fontName: '粉圓', quantity: 1,
      design: { text: 'ONEGOODS', font: 'huninn', colors: { border: '#f2c879', fill: '#efb39e', ink: '#fffcf5' } },
    } : productId ? productDraft : params.has('start') ? null : JSON.parse(sessionStorage.getItem('ogs-order-preview') || 'null');
    if (draft && (params.get('sample') === 'clicker' || productId)) {
      sessionStorage.setItem('ogs-order-preview', JSON.stringify(draft));
      sessionStorage.setItem('ogs-checkout-provider', ecpay ? 'ecpay' : 'mock');
      history.replaceState(null, '', ecpay ? '?preview=1&payment=ecpay' : '?preview=1');
    }
    document.querySelector('main').hidden = false;
    el('checkout-start').hidden = !!draft && !draft.submitted;
    if (draft && !draft.submitted) showOrder(draft, ecpay, params.get('store'));
  }
}

function showOrder(draft, ecpay, returnedStoreToken) {
  const el = id => document.getElementById(id);
  const delivery = el('checkout-delivery');
  const review = el('checkout-review');
  const quantity = el('checkout-quantity');
  const custom = draft.kind === 'custom';
  const currency = new Intl.NumberFormat('zh-TW', { maximumFractionDigits: 2 });
  const money = n => 'NT$' + currency.format(n);
  const methodOptions = el('checkout-method-options');
  for (const [value, method] of Object.entries(methods)) {
    const label = document.createElement('label');
    const input = document.createElement('input');
    const title = document.createElement('span');
    const fee = document.createElement('strong');
    input.type = 'radio';
    input.name = 'method';
    input.value = value;
    input.required = true;
    title.textContent = method.label;
    if (method.carriers) {
      const carriers = document.createElement('small');
      carriers.className = 'checkout-shipping-carriers';
      carriers.textContent = method.carriers.join('、');
      title.append(carriers);
    }
    fee.textContent = money(method.fee);
    label.append(input, title, fee);
    methodOptions.append(label);
  }
  const focusMethod = () => (methodOptions.querySelector(':checked') || methodOptions.querySelector('input')).focus();

  function details(list, rows) {
    list.replaceChildren();
    for (const [label, value, color] of rows) {
      const row = document.createElement('div');
      const term = document.createElement('dt');
      const description = document.createElement('dd');
      term.textContent = label;
      if (color && /^#[a-f\d]{6}$/i.test(color)) {
        const swatch = document.createElement('span');
        swatch.className = 'checkout-swatch';
        swatch.style.backgroundColor = color;
        description.append(swatch);
      }
      description.append(value);
      row.append(term, description);
      list.append(row);
    }
  }

  const panels = {
    cart: el('checkout-cart'), delivery, review, payment: el('checkout-payment'), done: el('checkout-done'),
  };
  const titles = { cart: '購物袋', delivery: '填寫配送資料', review: '確認訂單', payment: '付款', done: '訂單完成' };
  const account = el('checkout-account');
  let orderNumber;
  let submission;

  function step(next) {
    for (const [name, panel] of Object.entries(panels)) panel.hidden = name !== next;
    el('checkout-review-actions').hidden = next !== 'review';
    el('checkout-title').textContent = titles[next];
    quantity.readOnly = next !== 'cart';
    for (const item of document.querySelectorAll('[data-step]')) {
      if (item.dataset.step === next) item.setAttribute('aria-current', 'step');
      else item.removeAttribute('aria-current');
    }
    el('checkout-title').focus();
    window.scrollTo(0, 0);
  }

  function updateTotals() {
    const amount = draft.price * (custom ? 1 : quantity.valueAsNumber || 1);
    const method = methods[delivery.elements.method.value];
    el('checkout-subtotal').textContent = money(amount);
    el('checkout-shipping').textContent = method ? money(method.fee) : '選擇配送後顯示';
    el('checkout-total-line').hidden = !method;
    if (method) el('checkout-total').textContent = money(amount + method.fee);
  }

  el('checkout-flow').hidden = false;
  el('checkout-item').textContent = draft.name;
  el('checkout-back').textContent = custom ? '返回修改設計' : '返回商品';
  el('checkout-back').href = custom
    ? '/nameplate?style=name-clicker&order-preview=1'
    : '/product?id=' + encodeURIComponent(draft.id) + '&order-preview=1';
  if (draft.image) {
    const photo = el('checkout-image');
    photo.src = draft.image;
    photo.alt = draft.name;
    photo.hidden = false;
  }
  if (custom) {
    const colors = { '#a087c1': '薰衣草紫', '#fffcf5': '奶油白', '#f2c879': '蜂蜜金',
      '#393142': '炭灰', '#b8d6bd': '薄荷綠', '#efb39e': '蜜桃粉' };
    const { text, colors: selected } = draft.design;
    details(el('checkout-design'), [
      ['姓名或文字', text], ['字型', draft.fontName],
      ['外框', colors[selected.border] || selected.border, selected.border],
      ['內底', colors[selected.fill] || selected.fill, selected.fill],
      ['文字', colors[selected.ink] || selected.ink, selected.ink],
    ]);
    el('checkout-design').hidden = false;
  } else {
    el('checkout-quantity-field').hidden = false;
    quantity.addEventListener('input', updateTotals);
  }
  step('cart');
  updateTotals();

  el('checkout-continue').addEventListener('click', () => {
    if (!custom && !quantity.reportValidity()) return;
    step('delivery');
  });
  el('checkout-member').addEventListener('click', () => {
    account.hidden = false;
    el('checkout-email').focus();
  });
  el('checkout-guest').addEventListener('click', () => {
    account.hidden = true;
    focusMethod();
  });
  el('checkout-account-form').addEventListener('submit', event => {
    event.preventDefault();
    el('checkout-member').textContent = '已登入測試帳戶';
    el('checkout-member').disabled = true;
    account.hidden = true;
    focusMethod();
  });
  const fields = delivery.elements;
  const home = el('checkout-home-fields');
  const storeFields = el('checkout-store-fields');
  const selectedStore = el('checkout-selected-store');
  const pickStore = el('checkout-pick-store');
  const carrier = el('checkout-carrier');
  const addressNames = ['city', 'district', 'postalCode', 'street', 'unit'];
  const mapPath = '/api/checkout-delivery-preview/';
  const read = async (path, payload) => {
    const options = payload ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) } : {};
    const response = await fetch(mapPath + path, options);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || '暫時無法取得配送資料。');
    return data;
  };
  let storeToken;
  let store;
  const clearStore = () => {
    store = undefined;
    storeToken = undefined;
    selectedStore.textContent = '';
  };
  carrier.addEventListener('change', clearStore);
  function syncMethod() {
    storeFields.hidden = fields.method.value !== 'store';
    home.hidden = home.disabled = fields.method.value !== 'home';
    updateTotals();
  }
  methodOptions.addEventListener('change', syncMethod);
  pickStore.addEventListener('click', async () => {
    pickStore.disabled = true;
    try {
      const map = await read('store-start', { carrier: carrier.value, mobile: matchMedia('(max-width: 650px)').matches });
      sessionStorage.setItem('ogs-store-map-draft', JSON.stringify({
        token: map.token, carrier: carrier.value, ecpay, contact: fields.contact.value, phone: fields.phone.value, quantity: quantity.value,
      }));
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = map.action;
      for (const [name, value] of Object.entries(map.fields)) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = value;
        form.append(input);
      }
      document.body.append(form);
      form.submit();
    } catch (error) {
      selectedStore.textContent = error.message;
      pickStore.disabled = false;
    }
  });

  if (returnedStoreToken) {
    const saved = JSON.parse(sessionStorage.getItem('ogs-store-map-draft') || 'null');
    if (saved?.token === returnedStoreToken) {
      ecpay = saved.ecpay;
      fields.method.value = 'store';
      carrier.value = saved.carrier;
      fields.contact.value = saved.contact;
      fields.phone.value = saved.phone;
      quantity.value = saved.quantity;
      syncMethod();
      step('delivery');
      read('store?token=' + encodeURIComponent(returnedStoreToken)).then(result => {
        if (!result.store) throw new Error('選店已逾時，請重新選擇。');
        store = result.store;
        storeToken = returnedStoreToken;
        selectedStore.textContent = store.carrier + ' ' + store.name + '（' + store.id + '） · ' + store.address;
        history.replaceState(null, '', ecpay ? '?preview=1&payment=ecpay&store=' + storeToken : '?preview=1&store=' + storeToken);
      }).catch(error => { selectedStore.textContent = error.message; });
    }
  }

  const search = el('checkout-address-search');
  const suggestions = el('checkout-address-suggestions');
  const searchStatus = el('checkout-address-status');
  const attribution = el('checkout-address-attribution');
  let searchVersion = 0;
  let timer;
  let sessionToken;
  read('config').then(config => {
    if (!config.storeMap) pickStore.disabled = true;
    search.disabled = !config.googlePlaces;
    if (!config.googlePlaces) searchStatus.textContent = 'Google 地址搜尋尚未啟用，可手動填寫。';
  }).catch(() => { searchStatus.textContent = '請手動填寫地址。'; });
  function applyAddress(place) {
    const get = (...types) => types.map(type => place.addressComponents?.find(component => component.types.includes(type))?.longText).find(Boolean) || '';
    const formatted = (place.formattedAddress || '').replace(/^\d{3,6}\s*/, '').replace(/^(?:台灣|臺灣)\s*/, '').trim();
    const city = get('administrative_area_level_1') || formatted.match(/^.{2,3}[縣市]/)?.[0] || '';
    const remainder = city ? formatted.replace(city, '').trim() : formatted;
    const district = remainder.match(/^.{1,5}[區鄉鎮市]/)?.[0]
      || get('administrative_area_level_3', 'sublocality_level_1', 'locality', 'administrative_area_level_2');
    fields.city.value = city;
    fields.district.value = district === city ? '' : district;
    fields.postalCode.value = get('postal_code');
    const addressLine = remainder.replace(district, '').trim();
    fields.street.value = addressLine || [get('route'), get('street_number')].filter(Boolean).join('');
  }
  search.addEventListener('input', () => {
    const version = ++searchVersion;
    clearTimeout(timer);
    suggestions.replaceChildren();
    attribution.hidden = true;
    const input = search.value.trim();
    if (input.length < 3) return;
    sessionToken ||= crypto.randomUUID();
    timer = setTimeout(async () => {
      try {
        const data = await read('places', { input, sessionToken });
        if (version !== searchVersion) return;
        for (const { placePrediction: place } of (data.suggestions || [])) {
          if (!place) continue;
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'button cream';
          button.textContent = place.text.text;
          button.addEventListener('click', async () => {
            const selection = ++searchVersion;
            try {
              const detail = await read('places', { placeId: place.placeId, sessionToken });
              if (selection !== searchVersion) return;
              applyAddress(detail);
              search.value = detail.formattedAddress || button.textContent;
              suggestions.replaceChildren();
              searchStatus.textContent = '';
              sessionToken = undefined;
            } catch (error) { searchStatus.textContent = error.message; }
          });
          suggestions.append(button);
        }
        attribution.hidden = !suggestions.childElementCount;
        searchStatus.textContent = suggestions.childElementCount ? '' : '沒有符合的地址，可手動填寫。';
      } catch (error) {
        if (version === searchVersion) searchStatus.textContent = error.message;
      }
    }, 300);
  });

  const address = () => Object.fromEntries(addressNames.map(name => [name, fields[name].value.trim()]));
  const addressLabel = ({postalCode, city, district, street, unit}) => [postalCode, city + district + street, unit].filter(Boolean).join(' ');
  el('checkout-fill-example').addEventListener('click', () => {
    fields.method.value ||= 'store';
    syncMethod();
    fields.contact.value = '測試買家';
    fields.phone.value = '0900000000';
    if (fields.method.value === 'home') {
      for (const [name, value] of Object.entries({ city: '臺北市', district: '中正區', postalCode: '100', street: '測試路 1 號', unit: '3 樓之 2' })) fields[name].value = value;
    }
  });
  delivery.addEventListener('submit', event => {
    event.preventDefault();
    const { method, contact, phone } = fields;
    if (method.value === 'store' && !store) {
      selectedStore.textContent = '請先選擇取貨門市。';
      pickStore.focus();
      return;
    }
    const destinationRows = method.value === 'store'
      ? [['取貨門市', store.carrier + ' ' + store.name], ['門市代號', store.id], ['門市地址', store.address]]
      : [['收件地址', addressLabel(address())]];
    details(el('checkout-delivery-summary'), [
      ['配送方式', methods[method.value].label], ['配送費', money(methods[method.value].fee)],
      ['收件人', contact.value], ['聯絡電話', phone.value], ...destinationRows,
    ]);
    step('review');
  });
  el('checkout-edit').addEventListener('click', () => step('delivery'));
  const submit = el('checkout-submit');
  const error = el('checkout-submit-error');
  if (ecpay) submit.textContent = '前往綠界測試付款';
  submit.addEventListener('click', async () => {
    const { method, contact, phone } = fields;
    const payload = {
      item: custom ? { kind: draft.kind, design: draft.design } : { kind: draft.kind, id: draft.id, quantity: quantity.valueAsNumber },
      method: method.value, contact: contact.value, phone: phone.value,
      ...(method.value === 'store' ? { storeToken } : { address: address() }),
    };
    const snapshot = JSON.stringify(payload);
    if (submission?.snapshot !== snapshot) submission = { snapshot, requestId: crypto.randomUUID() };
    submit.disabled = true;
    error.hidden = true;
    try {
      const response = await fetch('/api/checkout-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, requestId: submission.requestId, provider: ecpay ? 'ecpay' : undefined }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      if (data.checkoutUrl) {
        location.assign(data.checkoutUrl);
        return;
      }
      orderNumber = data.id;
      el('checkout-subtotal').textContent = money(data.subtotal);
      el('checkout-shipping').textContent = money(data.shipping);
      el('checkout-total').textContent = money(data.total);
      el('checkout-payment-status').textContent = '測試單 ' + orderNumber;
      step('payment');
    } catch (failure) {
      error.textContent = failure.message || '目前無法建立測試單，請再試一次。';
      error.hidden = false;
    } finally {
      submit.disabled = false;
    }
  });
  const paymentActions = ['pending', 'failure', 'success'].map(state => el('checkout-test-' + state));
  const stateLabels = { pending: '付款處理中', failure: '付款失敗，可重新嘗試' };
  for (const [index, state] of ['pending', 'failure', 'success'].entries()) {
    paymentActions[index].addEventListener('click', async () => {
      paymentActions.forEach(button => { button.disabled = true; });
      const status = el('checkout-payment-status');
      try {
        const response = await fetch('/api/checkout-preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ requestId: submission.requestId, paymentState: state }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        if (result.status !== 'success') {
          status.textContent = orderNumber + ' · ' + stateLabels[result.status];
          return;
        }
        details(el('checkout-receipt'), [
          ['訂單編號', orderNumber],
          ['付款狀態', '模擬成功'],
          ['合計', el('checkout-total').textContent],
        ]);
        sessionStorage.setItem('ogs-order-preview', JSON.stringify({ ...draft, submitted: true }));
        delivery.reset();
        el('checkout-delivery-summary').replaceChildren();
        el('checkout-back').hidden = true;
        el('checkout-quantity-field').hidden = true;
        step('done');
      } catch (failure) {
        status.textContent = failure.message || '目前無法更新測試單，請再試一次。';
      } finally {
        paymentActions.forEach(button => { button.disabled = false; });
      }
    });
  }
}
