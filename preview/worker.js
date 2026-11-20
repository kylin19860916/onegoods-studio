// Read-only catalogue snapshot for review. No production bindings or merchant secrets.
import catalogue from './catalog.json';
import variants from './images.json';
export default {
 async fetch(request, env) {
  const url=new URL(request.url);
  if (request.method !== 'GET' && request.method !== 'HEAD') return new Response('Preview is read-only',{status:405});
  if(url.pathname==='/api/catalog')return Response.json(catalogue,{headers:{'Cache-Control':'no-store'}});
  if(url.pathname==='/api/store-payment/config')return Response.json({enabled:false},{headers:{'Cache-Control':'no-store'}});
  if(url.pathname.startsWith('/api/') || url.pathname.startsWith('/admin') || url.pathname.includes('signin-with-chatgpt'))return new Response('Unavailable in review',{status:404});
  const replacement=variants[url.pathname]?.url;
  if (replacement) url.pathname='/'+replacement;
  return env.ASSETS.fetch(new Request(url,request));
 }
};
