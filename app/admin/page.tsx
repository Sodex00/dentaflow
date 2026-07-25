"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import "./admin.css";

type Lead={id:number;name:string;phone:string;service:string;status:"new"|"accepted";appointment_at:string|null;created_at:string};
type TgUser={first_name?:string;last_name?:string;username?:string};
declare global{interface Window{Telegram?:{WebApp?:{initData:string;initDataUnsafe?:{user?:TgUser};ready():void;expand():void;HapticFeedback?:{impactOccurred(style:string):void;notificationOccurred(type:string):void}}}}}

const demo="denta_admin";
const formatDate=(value:string)=>new Date(value.endsWith("Z")?value:`${value}Z`).toLocaleString("ru-RU",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"});

export default function Admin(){
  const [items,setItems]=useState<Lead[]>([]);
  const [tab,setTab]=useState<"new"|"accepted">("new");
  const [loading,setLoading]=useState(true);
  const [denied,setDenied]=useState("");
  const [profile,setProfile]=useState<TgUser>({first_name:"Администратор"});

  const headers=()=>{const initData=window.Telegram?.WebApp?.initData;return initData?{"x-telegram-init-data":initData}:{"x-demo-user":demo}};
  const load=useCallback(async()=>{setLoading(true);try{const r=await fetch("/api/admin/requests",{headers:headers()});const d=await r.json();if(!r.ok){setDenied(d.username?`Telegram передал @${d.username}. Добавьте его в ADMIN_USERNAMES.`:d.reason==="invalid_signature"?"Подпись Telegram не прошла проверку. Проверьте токен бота.":"Telegram username не получен. Укажите его в настройках профиля.");return}setDenied("");setItems(d.requests)}finally{setLoading(false)}},[]);

  useEffect(()=>{const start=()=>{const webApp=window.Telegram?.WebApp;setProfile(webApp?.initDataUnsafe?.user||{first_name:"Администратор"});webApp?.ready();webApp?.expand();load()};if(window.Telegram?.WebApp){start();return}const script=document.createElement("script");script.src="https://telegram.org/js/telegram-web-app.js";script.onload=start;document.head.appendChild(script);return()=>{script.onload=null}},[load]);

  async function update(id:number,status:"new"|"accepted",appointment_at?:string){window.Telegram?.WebApp?.HapticFeedback?.impactOccurred("light");await fetch("/api/admin/requests",{method:"PATCH",headers:{...headers(),"content-type":"application/json"},body:JSON.stringify({id,status,appointment_at})});if(status==="accepted")window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred("success");await load()}

  const counts=useMemo(()=>({new:items.filter(x=>x.status==="new").length,accepted:items.filter(x=>x.status==="accepted").length}),[items]);
  const filtered=items.filter(x=>x.status===tab);
  const displayName=profile.first_name||profile.username||"Администратор";
  const initials=`${profile.first_name?.[0]||"D"}${profile.last_name?.[0]||""}`.toUpperCase();

  if(denied)return <main className="mini accessScreen"><div className="accessMark">✦</div><span className="overline">DENTAFLOW · SECURE AREA</span><h1>Доступ<br/><em>ограничен.</em></h1><p>{denied}</p><a href="https://t.me/DentaFlow_stoma_bot">Вернуться в бот <span>↗</span></a></main>;

  return <main className="mini">
    <header className="adminHeader"><div><span className="overline">DENTAFLOW · CONTROL</span><h1>Здравствуйте,<br/><em>{displayName}</em></h1></div><div className="profile"><span>{initials}</span><i/></div></header>

    <section className="pulseCard"><div className="pulseTop"><span><i/> Клиника открыта</span><small>{new Date().toLocaleDateString("ru-RU",{weekday:"long",day:"numeric",month:"long"})}</small></div><div className="pulseMain"><div><strong>{counts.new}</strong><span>новых<br/>обращений</span></div><div className="miniStat"><b>{counts.accepted}</b><span>принято</span></div></div><div className="pulseLine"><i style={{width:`${Math.min(100,Math.max(12,counts.accepted/(Math.max(1,items.length))*100))}%`}}/></div></section>

    <nav className="tabs" aria-label="Статус заявок"><button className={tab==="new"?"active":""} onClick={()=>setTab("new")}><span>Новые</span><b>{counts.new}</b></button><button className={tab==="accepted"?"active":""} onClick={()=>setTab("accepted")}><span>Принятые</span><b>{counts.accepted}</b></button></nav>

    <section className="feed"><div className="feedTitle"><span>{tab==="new"?"Ожидают ответа":"Запланированные визиты"}</span><button onClick={load} aria-label="Обновить заявки">Обновить ↻</button></div>
      {loading?<div className="state"><i className="loader"/><p>Синхронизируем заявки…</p></div>:filtered.length===0?<div className="state"><div className="stateIcon">✓</div><h2>{tab==="new"?"Всё под контролем":"Визитов пока нет"}</h2><p>{tab==="new"?"Все новые заявки уже обработаны.":"Принятые заявки появятся здесь."}</p></div>:filtered.map((lead,index)=><article className="leadCard" key={lead.id}>
        <div className="leadMeta"><span className="leadIndex">{String(index+1).padStart(2,"0")}</span><span>{formatDate(lead.created_at)}</span></div>
        <div className="leadIdentity"><div><h2>{lead.name}</h2><a href={`tel:${lead.phone}`}>{lead.phone}</a></div><a className="call" href={`tel:${lead.phone}`} aria-label={`Позвонить ${lead.name}`}>↗</a></div>
        <div className="serviceTag"><i/> {lead.service||"Первичная консультация"}</div>
        {tab==="new"?<button className="accept" onClick={()=>update(lead.id,"accepted")}><span>Принять заявку</span><b>→</b></button>:<div className="schedule"><label><span>Дата и время визита</span><input type="datetime-local" value={lead.appointment_at||""} onChange={event=>update(lead.id,"accepted",event.target.value)}/></label><button onClick={()=>update(lead.id,"new")}>Вернуть</button></div>}
      </article>)}
    </section>
    <div className="safeArea"/>
  </main>;
}
