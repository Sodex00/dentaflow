"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import "./admin.css";
import "./web.css";

type Lead={id:number;name:string;phone:string;service:string;status:"new"|"accepted";appointment_at:string|null;created_at:string};
const apiBase=(import.meta.env?.VITE_API_BASE||"").replace(/\/$/,"");
const formatDate=(value:string)=>new Date(value.endsWith("Z")?value:`${value}Z`).toLocaleString("ru-RU",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"});

export default function Admin(){
  const [items,setItems]=useState<Lead[]>([]);
  const [tab,setTab]=useState<"new"|"accepted">("new");
  const [loading,setLoading]=useState(false);
  const [password,setPassword]=useState("");
  const [authorized,setAuthorized]=useState(false);
  const [error,setError]=useState("");

  const load=useCallback(async(secret?:string)=>{
    const key=secret||password;
    if(!key)return;
    setLoading(true);
    try{
      const response=await fetch(`${apiBase}/api/admin/requests`,{headers:{"x-admin-password":key}});
      if(!response.ok){setAuthorized(false);setError("Неверный пароль");return;}
      const data=await response.json();
      sessionStorage.setItem("dentaflow-admin",key);
      setPassword(key);setAuthorized(true);setError("");setItems(data.requests);
    }catch{setError("Backend временно недоступен");}
    finally{setLoading(false);}
  },[password]);

  useEffect(()=>{const saved=sessionStorage.getItem("dentaflow-admin");if(saved)load(saved)},[load]);

  async function update(id:number,status:"new"|"accepted",appointment_at?:string){
    await fetch(`${apiBase}/api/admin/requests`,{method:"PATCH",headers:{"x-admin-password":password,"content-type":"application/json"},body:JSON.stringify({id,status,appointment_at})});
    await load();
  }

  const counts=useMemo(()=>({new:items.filter(x=>x.status==="new").length,accepted:items.filter(x=>x.status==="accepted").length}),[items]);
  const filtered=items.filter(x=>x.status===tab);

  if(!authorized)return <main className="mini loginScreen"><section className="loginCard"><span className="overline">DENTAFLOW · ADMIN</span><div className="accessMark">✦</div><h1>Панель<br/><em>управления.</em></h1><p>Введите пароль администратора для доступа к заявкам.</p><form onSubmit={event=>{event.preventDefault();load()}}><label>Пароль<input type="password" value={password} onChange={event=>setPassword(event.target.value)} autoFocus autoComplete="current-password" placeholder="••••••••"/></label>{error&&<small className="loginError">{error}</small>}<button className="accept" disabled={loading}>{loading?"Проверяем…":"Войти →"}</button></form><a href="../">← Вернуться на сайт</a></section></main>;

  return <main className="mini">
    <header className="adminHeader"><div><span className="overline">DENTAFLOW · CONTROL</span><h1>Панель<br/><em>администратора</em></h1></div><button className="logout" onClick={()=>{sessionStorage.removeItem("dentaflow-admin");setAuthorized(false);setPassword("")}}>Выйти</button></header>
    <section className="pulseCard"><div className="pulseTop"><span><i/> Клиника открыта</span><small>{new Date().toLocaleDateString("ru-RU",{weekday:"long",day:"numeric",month:"long"})}</small></div><div className="pulseMain"><div><strong>{counts.new}</strong><span>новых<br/>обращений</span></div><div className="miniStat"><b>{counts.accepted}</b><span>принято</span></div></div><div className="pulseLine"><i style={{width:`${Math.min(100,Math.max(12,counts.accepted/Math.max(1,items.length)*100))}%`}}/></div></section>
    <nav className="tabs"><button className={tab==="new"?"active":""} onClick={()=>setTab("new")}><span>Новые</span><b>{counts.new}</b></button><button className={tab==="accepted"?"active":""} onClick={()=>setTab("accepted")}><span>Принятые</span><b>{counts.accepted}</b></button></nav>
    <section className="feed"><div className="feedTitle"><span>{tab==="new"?"Ожидают ответа":"Запланированные визиты"}</span><button onClick={()=>load()}>Обновить ↻</button></div>
      {loading?<div className="state"><i className="loader"/><p>Загружаем заявки…</p></div>:filtered.length===0?<div className="state"><div className="stateIcon">✓</div><h2>{tab==="new"?"Всё под контролем":"Визитов пока нет"}</h2><p>{tab==="new"?"Все заявки обработаны.":"Принятые заявки появятся здесь."}</p></div>:filtered.map((lead,index)=><article className="leadCard" key={lead.id}><div className="leadMeta"><span className="leadIndex">{String(index+1).padStart(2,"0")}</span><span>{formatDate(lead.created_at)}</span></div><div className="leadIdentity"><div><h2>{lead.name}</h2><a href={`tel:${lead.phone}`}>{lead.phone}</a></div><a className="call" href={`tel:${lead.phone}`}>↗</a></div><div className="serviceTag"><i/> {lead.service||"Первичная консультация"}</div>{tab==="new"?<button className="accept" onClick={()=>update(lead.id,"accepted")}><span>Принять заявку</span><b>→</b></button>:<div className="schedule"><label><span>Дата и время визита</span><input type="datetime-local" value={lead.appointment_at||""} onChange={event=>update(lead.id,"accepted",event.target.value)}/></label><button onClick={()=>update(lead.id,"new")}>Вернуть</button></div>}</article>)}
    </section>
  </main>;
}
