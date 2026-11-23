import { HttpError, json } from './catalog';
import { validHomeAddress } from './taiwan-address';
import localData from '../src/taiwan-address-data.json';
type Env = Cloudflare.Env & { OGS_GOOGLE_PLACES_KEY?: string; OGS_GOOGLE_PLACES_ENABLED?: string };
const origin = 'https://onegoods.studio';
const root = '/api/address-search/';
const enabled = (env: Env) => env.OGS_GOOGLE_PLACES_ENABLED === 'true' && !!env.OGS_GOOGLE_PLACES_KEY && !!env.DB;
async function take(db: D1Database, bucket: string, limit: number, expires: number) {
  return !!await db.prepare(`INSERT INTO google_places_usage (bucket, used, expires_at) VALUES (?,1,?)
    ON CONFLICT(bucket) DO UPDATE SET used=used+1 WHERE used < ? RETURNING used`)
    .bind(bucket, expires, limit).first();
}
async function budget(request: Request, env: Env) {
  const now = new Date(), month = now.toISOString().slice(0,7), minute = Math.floor(now.getTime()/60000);
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode((request.headers.get('CF-Connecting-IP') || 'unknown') + '|' + env.OGS_GOOGLE_PLACES_KEY));
  const ip = Array.from(new Uint8Array(hash), n => n.toString(16).padStart(2,'0')).join('').slice(0,24);
  // D1 counters are atomic across Worker instances. Count before every external call,
  // including failures/timeouts. No address queries or raw IP addresses are stored.
  if (!await take(env.DB!, 'minute:'+minute+':'+ip, 20, now.getTime()+120000)) throw new HttpError(429,'搜尋較頻繁，請稍後再試，或直接填寫地址。');
  if (!await take(env.DB!, 'month:'+month, 3000, Date.UTC(now.getUTCFullYear(),now.getUTCMonth()+1,2))) throw new HttpError(429,'地址搜尋暫時額滿，請直接填寫地址。');
  await env.DB!.prepare('DELETE FROM google_places_usage WHERE expires_at < ?').bind(now.getTime()).run();
}
function addressFrom(place: {addressComponents?: Array<{longText: string;shortText?: string;types:string[]}>;formattedAddress?:string}) {
  const components = place.addressComponents || [];
  const get = (...types:string[]) => types.map(type=>components.find(c=>c.types.includes(type))?.longText || '').find(Boolean) || '';
  if (components.find(c=>c.types.includes('country'))?.shortText !== 'TW') throw new HttpError(400,'請選擇台灣本島的配送地址。');
  const canonical = (s:string) => s.replaceAll('台','臺');
  const formatted = (place.formattedAddress || '').replace(/^\d{3,6}\s*/, '').replace(/^(?:台灣|臺灣|Taiwan)\s*/, '').replace(/^\d{3,6}\s*/, '').trim();
  const cities = localData.cities as Record<string,Record<string,string>>;
  const names = components.map(c=>canonical(c.longText));
  const city = names.find(name=>Object.hasOwn(cities,name)) || Object.keys(cities).find(name=>canonical(formatted).startsWith(name)) || '';
  const districts = cities[city] || {};
  const remainder = canonical(formatted).startsWith(city) ? formatted.slice(city.length).trim() : '';
  const district = names.find(name=>Object.hasOwn(districts,name)) || Object.keys(districts).find(name=>canonical(remainder).startsWith(name)) || '';
  const postalCode = districts[district] || '';
  if(!validHomeAddress(city,district,postalCode)) throw new HttpError(400,'這個地址不在目前配送範圍，請確認縣市和行政區。');
  let street = canonical(remainder).startsWith(district) ? remainder.slice(district.length).trim() : [get('route'),get('street_number')].filter(Boolean).join('');
  if(!street) throw new HttpError(400,'搜尋結果沒有完整街道，請直接填寫街道與門牌。');
  return {city,district,postalCode,street};
}
export async function addressSearch(request: Request, env: Env, googleFetch: typeof fetch = fetch) {
  const url = new URL(request.url);
  const local = import.meta.env.DEV && ['localhost','127.0.0.1'].includes(url.hostname);
  if(url.origin !== origin && !local) return json({},404);
  const action = url.pathname.slice(root.length);
  if(action === 'config' && request.method === 'GET') return json({enabled:enabled(env)});
  if(action !== 'places' || request.method !== 'POST') return json({},404);
  if(request.headers.get('Origin') !== url.origin || !request.headers.get('Content-Type')?.startsWith('application/json')) return json({},403);
  if(!enabled(env)) return json({error:'地址搜尋尚未啟用，請直接填寫地址。'},503);
  try {
    const raw = await request.text();if(raw.length > 2048) throw new HttpError(413,'搜尋內容過長，請縮短地址。');
    const body = JSON.parse(raw);
    if(!body || typeof body !== 'object' || !/^[a-zA-Z0-9_-]{1,36}$/.test(body.sessionToken || '')) throw new HttpError(400,'請重新輸入搜尋地址。');
    const placeId = typeof body.placeId === 'string' ? body.placeId : '';
    const input = typeof body.input === 'string' ? body.input.trim() : '';
    if(placeId && !/^[\w-]{1,250}$/.test(placeId)) throw new HttpError(400,'地址識別碼無效。');
    if(!placeId && input.length < 3) return json({suggestions:[]});
    if(!placeId && input.length > 180) throw new HttpError(400,'搜尋內容過長，請縮短地址。');
    await budget(request, env);
    const endpoint = 'https://places.googleapis.com/v1/';
    const response = await (placeId ? googleFetch(endpoint+'places/'+placeId+'?'+new URLSearchParams({sessionToken:body.sessionToken,languageCode:'zh-TW',regionCode:'TW'}),
      {headers:{'X-Goog-Api-Key':env.OGS_GOOGLE_PLACES_KEY!,'X-Goog-FieldMask':'formattedAddress,addressComponents'},signal:AbortSignal.timeout(8000)}) :
      googleFetch(endpoint+'places:autocomplete',{method:'POST',headers:{'Content-Type':'application/json','X-Goog-Api-Key':env.OGS_GOOGLE_PLACES_KEY!,
        'X-Goog-FieldMask':'suggestions.placePrediction.placeId,suggestions.placePrediction.text'},
        body:JSON.stringify({input,sessionToken:body.sessionToken,includedRegionCodes:['tw'],languageCode:'zh-TW',regionCode:'TW'}),signal:AbortSignal.timeout(8000)}));
    if(!response.ok) throw new HttpError(502,'暫時無法搜尋地址，請直接填寫。');
    const data = await response.json() as any;
    if(placeId) {
      const address = addressFrom(data);
      // Invalid/incomplete results must not overwrite the buyer's manual fields.
      return json({address,formattedAddress:typeof data.formattedAddress === 'string' ? data.formattedAddress : ''});
    }
    return json({suggestions:(data.suggestions || []).slice(0,5).flatMap((s:any)=>{
      const p=s.placePrediction;return p && typeof p.placeId==='string' && typeof p.text?.text==='string' ? [{placeId:p.placeId,text:p.text.text}] : [];
    })});
  } catch(error) {
    if(error instanceof HttpError) return json({error:error.message},error.status);
    if(error instanceof SyntaxError) return json({error:'搜尋資料格式不正確。'},400);
    return json({error:'暫時無法搜尋地址，請直接填寫。'},503);
  }
}
