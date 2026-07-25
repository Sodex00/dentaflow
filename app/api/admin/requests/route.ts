import { env } from "cloudflare:workers";
type AppEnv={DB:D1Database;TELEGRAM_BOT_TOKEN?:string;ADMIN_USERNAMES?:string;DEMO_MODE?:string};
const e=()=>env as unknown as AppEnv;
async function init(){await e().DB.prepare(`CREATE TABLE IF NOT EXISTS requests (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, phone TEXT NOT NULL, service TEXT, status TEXT NOT NULL DEFAULT 'new', appointment_at TEXT, accepted_by TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`).run()}
async function hmac(key:ArrayBuffer|string,data:string){const raw=typeof key==="string"?new TextEncoder().encode(key):key;const k=await crypto.subtle.importKey("raw",raw,{name:"HMAC",hash:"SHA-256"},false,["sign"]);return crypto.subtle.sign("HMAC",k,new TextEncoder().encode(data))}
const hex=(b:ArrayBuffer)=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("");
async function user(request:Request){
  const initData=request.headers.get("x-telegram-init-data")||"", demo=request.headers.get("x-demo-user")||"";let username="";
  if(initData&&e().TELEGRAM_BOT_TOKEN){const p=new URLSearchParams(initData),hash=p.get("hash")||"";p.delete("hash");const check=[...p.entries()].sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>`${k}=${v}`).join("\n");try{username=JSON.parse(p.get("user")||"{}").username||""}catch{return {admin:null,username:"",reason:"invalid_user"}}const secret=await hmac("WebAppData",e().TELEGRAM_BOT_TOKEN);if(hex(await hmac(secret,check))!==hash)return {admin:null,username,reason:"invalid_signature"}}
  else if(demo&&e().DEMO_MODE==="true")username=demo;
  const allowed=(e().ADMIN_USERNAMES||"denta_admin,portfolio_owner").split(",").map(x=>x.trim().replace(/^@/,"").toLowerCase());
  return {admin:allowed.includes(username.replace(/^@/,"").toLowerCase())?username:null,username,reason:username?"not_allowed":"username_missing"};
}
export async function GET(request:Request){const auth=await user(request);if(!auth.admin)return Response.json({error:"Доступ запрещён",username:auth.username,reason:auth.reason},{status:403});await init();const {results}=await e().DB.prepare("SELECT * FROM requests ORDER BY CASE status WHEN 'new' THEN 0 ELSE 1 END, created_at DESC").all();return Response.json({requests:results,admin:auth.admin});}
export async function PATCH(request:Request){const auth=await user(request);if(!auth.admin)return Response.json({error:"Доступ запрещён",username:auth.username,reason:auth.reason},{status:403});const b=await request.json() as {id?:number;status?:string;appointment_at?:string};if(!b.id||!['new','accepted'].includes(b.status||''))return Response.json({error:"Некорректные данные"},{status:400});await init();await e().DB.prepare("UPDATE requests SET status=?, appointment_at=?, accepted_by=? WHERE id=?").bind(b.status,b.appointment_at||null,auth.admin,b.id).run();return Response.json({ok:true});}
