import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '../../chatgpt-auth';
import { catalogApi } from '../../../server/catalog';
export const dynamic='force-dynamic';
async function handle(request:Request){return catalogApi(request,env,await getChatGPTUser());}
export const GET=handle;export const POST=handle;export const PUT=handle;
