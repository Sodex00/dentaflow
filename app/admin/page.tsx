"use client";
import { useCallback, useEffect, useState } from "react";
import "./admin.css";
type Lead={id:number;name:string;phone:string;service:string;status:"new"|"accepted";appointment_at:string|null;created_at:string};
declare global{interface Window{Telegram?:{WebApp?:{initData:string;ready():void;expand():void}}}}
const demo="denta_admin";
export default function Admin(){
 const [items,setItems]=useState<Lead[]>([]),[tab,setTab]=useState<"new"|"accepted">("new"),[loading,setLoading]=useState(true),[denied,setDenied]=useState(false);
 const headers=()=>{const initData=window.Telegram?.WebApp?.initData;return initData?{"x-telegram-init-data":initData}:{"x-demo-user":demo}};
 const load=useCallback(async()=>{setLoading(true);const r=await fetch('/api/admin/requests',{headers:headers()});if(!r.ok){setDenied(true);setLoading(false);return}const d=await r.json();setItems(d.requests);setLoading(false)},[]);
 useEffect(()=>{window.Telegram?.WebApp?.ready();window.Telegram?.WebApp?.expand();load()},[load]);
 async function update(id:number,status:"new"|"accepted",appointment_at?:string){await fetch('/api/admin/requests',{method:'PATCH',headers:{...headers(),'content-type':'application/json'},body:JSON.stringify({id,status,appointment_at})});load()}
 const filtered=items.filter(x=>x.status===tab);
 if(denied)return <main className="mini denied"><div>✦</div><h1>Нет доступа</h1><p>Ваш Telegram username не добавлен в список администраторов.</p></main>;
 return <main className="mini"><header><div><small>DENTAFLOW · CRM</small><h1>Добрый день, Алина</h1></div><div className="avatar">А</div></header><section className="summary"><span>Сегодня</span><strong>{items.filter(x=>x.status==='new').length}</strong><small>новых заявок</small></section><nav><button className={tab==='new'?'active':''} onClick={()=>setTab('new')}>Новые <i>{items.filter(x=>x.status==='new').length}</i></button><button className={tab==='accepted'?'active':''} onClick={()=>setTab('accepted')}>Принятые <i>{items.filter(x=>x.status==='accepted').length}</i></button></nav><section className="cards">{loading?<div className="empty">Обновляем заявки…</div>:filtered.length===0?<div className="empty"><b>✓</b><p>{tab==='new'?'Все заявки разобраны':'Принятых заявок пока нет'}</p></div>:filtered.map((x,i)=><article key={x.id}><div className="cardTop"><span className="number">{String(i+1).padStart(2,'0')}</span><span className="time">{new Date(x.created_at+'Z').toLocaleString('ru',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</span></div><h2>{x.name}</h2><a href={`tel:${x.phone}`}>{x.phone} <b>↗</b></a><p>{x.service||'Первичная консультация'}</p>{tab==='new'?<button className="accept" onClick={()=>update(x.id,'accepted')}>Принять заявку <span>→</span></button>:<div className="schedule"><label>Время визита<input type="datetime-local" value={x.appointment_at||''} onChange={ev=>update(x.id,'accepted',ev.target.value)}/></label><button onClick={()=>update(x.id,'new')}>Вернуть</button></div>}</article>)}</section><button className="refresh" onClick={load} aria-label="Обновить">↻</button><script src="https://telegram.org/js/telegram-web-app.js" /></main>
}
