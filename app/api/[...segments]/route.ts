import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '../../chatgpt-auth';
import { logisticsCallbackPath, receiveLogisticsNotice } from '../../../server/ecpay-logistics';
import { catalogApi } from '../../../server/catalog';
import { isEcpayStageCallback } from '../../../server/ecpay-stage';
import { clickerOrderApi } from '../../../server/clicker-orders';
export const dynamic = 'force-dynamic';

async function handle(request: Request) {
  const path = new URL(request.url).pathname;
  if (path === logisticsCallbackPath) return receiveLogisticsNotice(request, env);
  if (isEcpayStageCallback(path)) return clickerOrderApi(request, env, null);
  const user = await getChatGPTUser();
  if (/^\/api\/(?:admin\/)?clicker-orders(?:\/|$)/.test(path)) return clickerOrderApi(request, env, user);
  return catalogApi(request, env, user);
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
