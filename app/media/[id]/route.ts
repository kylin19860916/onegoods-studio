import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '../../chatgpt-auth';
import { mediaApi } from '../../../server/catalog';
export const dynamic='force-dynamic';
export async function GET(request:Request){return mediaApi(new URL(request.url).pathname.split('/').pop()!,env,await getChatGPTUser());}
