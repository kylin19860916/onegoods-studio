import { env } from 'cloudflare:workers';
import { getChatGPTUser,chatGPTSignInPath } from '../chatgpt-auth';
import { isAdmin } from '../../server/catalog';
import html from '../../admin/index.html?raw';
export const dynamic='force-dynamic';
export async function GET(request:Request){const user=await getChatGPTUser();if(!user)return Response.redirect(new URL(chatGPTSignInPath('/admin'),request.url),302);if(!isAdmin(user,env))return new Response('<meta charset="utf-8"><h1>沒有管理權限</h1><p>請使用網站擁有者的ChatGPT帳號登入。</p><a href="/signout-with-chatgpt?return_to=%2Fadmin">登出並切換帳號</a>',{status:403,headers:{'Content-Type':'text/html;charset=utf-8','Cache-Control':'no-store'}});return new Response(html,{headers:{'Content-Type':'text/html;charset=utf-8','Cache-Control':'no-store'}});}
