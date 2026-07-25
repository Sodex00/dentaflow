import { env } from "cloudflare:workers";
type AppEnv={DB:D1Database;ADMIN_PASSWORD?:string};
const e=()=>env as unknown as AppEnv;
async function init(){await e().DB.prepare(`CREATE TABLE IF NOT EXISTS requests (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, phone TEXT NOT NULL, service TEXT, status TEXT NOT NULL DEFAULT 'new', appointment_at TEXT, accepted_by TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`).run()}
const cors={"access-control-allow-origin":"https://sodex00.github.io","access-control-allow-headers":"content-type,x-admin-password","access-control-allow-methods":"GET,PATCH,OPTIONS"};
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:cors});
const allowed=(request:Request)=>Boolean(e().ADMIN_PASSWORD&&request.headers.get("x-admin-password")===e().ADMIN_PASSWORD);
export async function OPTIONS(){return new Response(null,{status:204,headers:cors})}
export async function GET(request:Request){if(!allowed(request))return json({error:"Доступ запрещён"},401);await init();const {results}=await e().DB.prepare("SELECT * FROM requests ORDER BY CASE status WHEN 'new' THEN 0 ELSE 1 END, created_at DESC").all();return json({requests:results});}
export async function PATCH(request:Request){if(!allowed(request))return json({error:"Доступ запрещён"},401);const b=await request.json() as {id?:number;status?:string;appointment_at?:string};if(!b.id||!['new','accepted'].includes(b.status||''))return json({error:"Некорректные данные"},400);await init();await e().DB.prepare("UPDATE requests SET status=?, appointment_at=?, accepted_by=? WHERE id=?").bind(b.status,b.appointment_at||null,"web-admin",b.id).run();return json({ok:true});}
