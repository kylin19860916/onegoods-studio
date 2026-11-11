import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '../../chatgpt-auth';
import { catalogApi } from '../../../server/catalog';
import { clickerOrderApi } from '../../../server/clicker-orders';
export const dynamic='force-dynamic';
async function handle(request:Request){const user=await getChatGPTUser();const path=new URL(request.url).pathname;if(/^\/api\/(?:admin\/)?clicker-orders(?:\/|$)/.test(path))return clickerOrderApi(request,env,user);return catalogApi(request,env,user);}
export const GET=handle;export const POST=handle;export const PUT=handle;
