import { env } from "cloudflare:workers";

type AppEnv={DB:D1Database};
const db=()=> (env as unknown as AppEnv).DB;
async function init(){
  await db().prepare(`CREATE TABLE IF NOT EXISTS requests (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, phone TEXT NOT NULL, service TEXT, status TEXT NOT NULL DEFAULT 'new', appointment_at TEXT, accepted_by TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`).run();
  await db().prepare(`CREATE INDEX IF NOT EXISTS requests_status_idx ON requests(status, created_at)`).run();
}
function clean(v:unknown,max=120){return typeof v==="string"?v.trim().slice(0,max):""}
const cors={"access-control-allow-origin":"https://sodex00.github.io","access-control-allow-headers":"content-type","access-control-allow-methods":"POST,OPTIONS"};
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:cors});
export async function POST(request:Request){
  const body=await request.json() as Record<string,unknown>;const name=clean(body.name,80),phone=clean(body.phone,30),service=clean(body.service,80);
  if(name.length<2||phone.replace(/\D/g,"").length<10)return json({error:"Проверьте имя и телефон"},400);
  await init();const result=await db().prepare("INSERT INTO requests (name, phone, service) VALUES (?, ?, ?)").bind(name,phone,service).run();
  return json({ok:true,id:result.meta.last_row_id},201);
}
export async function OPTIONS(){return new Response(null,{status:204,headers:cors})}
