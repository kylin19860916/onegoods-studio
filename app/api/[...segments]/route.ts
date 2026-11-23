import { addressSearch } from '../../../server/address-search';
import { storePayment } from '../../../server/store-payment';
import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '../../chatgpt-auth';
import { logisticsCallbackPath, receiveLogisticsNotice } from '../../../server/ecpay-logistics';
import { catalogApi } from '../../../server/catalog';
import { isEcpayStageCallback } from '../../../server/ecpay-stage';
import { deliveryPreview } from '../../../server/checkout-delivery-preview';
import { logisticsPreview } from '../../../server/checkout-logistics-preview';
import { previewCheckout } from '../../../server/checkout-preview';
import { clickerOrderApi } from '../../../server/clicker-orders';
export const dynamic = 'force-dynamic';

async function handle(request: Request) {
  const path = new URL(request.url).pathname;
  if (path.startsWith('/api/address-search/')) return addressSearch(request, env);
  if (path.startsWith('/api/store-payment/')) return storePayment(request, env);
  if (path === logisticsCallbackPath) return receiveLogisticsNotice(request, env);
  if (isEcpayStageCallback(path)) return clickerOrderApi(request, env, null);
  if (/^\/api\/checkout-delivery-preview\/(?:store-return|public-store-start|public-store)$/.test(path)) return deliveryPreview(request, env, null);
  if (/^\/api\/checkout-logistics-preview\/notice(?:\/|$)/.test(path)) return logisticsPreview(request, env, null);
  const user = await getChatGPTUser();
  if (path.startsWith('/api/checkout-delivery-preview/')) return deliveryPreview(request, env, user);
  if (path.startsWith('/api/checkout-logistics-preview/')) return logisticsPreview(request, env, user);
  if (path === '/api/checkout-preview' || path === '/api/checkout-preview/config' || path.startsWith('/api/checkout-preview/payment/')) return previewCheckout(request, env, user);
  if (/^\/api\/(?:admin\/)?clicker-orders(?:\/|$)/.test(path)) return clickerOrderApi(request, env, user);
  return catalogApi(request, env, user);
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
