const params = new URLSearchParams(location.search);
const status = document.getElementById('payment-result');
const refresh = document.getElementById('payment-refresh');

async function loadPayment() {
  refresh.disabled = true;
  try {
    const response = await fetch('/api/store-payment/status?' + new URLSearchParams({
      id: params.get('id') || '', token: params.get('token') || '',
    }), { cache: 'no-store', referrerPolicy: 'no-referrer' });
    if (!response.ok) {
      status.textContent = response.status === 404 ? '找不到這筆訂單。' : '暫時無法查詢，請稍後再試。';
      return;
    }
    const order = await response.json();
    status.textContent = order.paid ? '付款成功' : '尚未收到付款確認。若已付款，請稍後重新查詢。';
    document.getElementById('payment-order').textContent = order.id + ' · NT$' + order.amount.toLocaleString('en-TW');
  } catch {
    status.textContent = '暫時無法查詢，請稍後再試。';
  } finally {
    refresh.disabled = false;
  }
}
refresh.addEventListener('click', loadPayment);
loadPayment();
