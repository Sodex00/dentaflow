"use client";

import { FormEvent, useState } from "react";
import { ToothScene } from "./components/ToothScene";

const apiBase = (import.meta.env?.VITE_API_BASE || "").replace(/\/$/, "");

const services = [
  { n: "01", title: "Диагностика", text: "Цифровой план лечения без лишних назначений", price: "от 1 500 ₽" },
  { n: "02", title: "Эстетика", text: "Виниры и реставрации с естественной анатомией", price: "от 12 000 ₽" },
  { n: "03", title: "Имплантация", text: "Восстановление зубов с пожизненным сопровождением", price: "от 39 000 ₽" },
  { n: "04", title: "Гигиена", text: "Деликатное очищение Air Flow и персональный уход", price: "от 5 900 ₽" },
];

export default function Home() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);
    try {
      const response = await fetch(`${apiBase}/api/requests`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: form.get("name"), phone: form.get("phone"), service: form.get("service") }),
      });
      if (!response.ok) throw new Error();
      setSent(true);
      e.currentTarget.reset();
    } catch {
      alert("Не удалось отправить заявку. Позвоните нам: +7 423 201-20-20");
    } finally { setLoading(false); }
  }

  return (
    <main>
      <header className="nav wrap">
        <a className="brand" href="#top"><span>D</span>DentaFlow</a>
        <nav aria-label="Главная навигация"><a href="#services">Услуги</a><a href="#approach">Подход</a><a href="#contact">Контакты</a></nav>
        <a className="navCta" href="#booking">Записаться <b>↗</b></a>
      </header>

      <section className="hero wrap" id="top">
        <div className="heroCopy">
          <div className="eyebrow"><i /> Стоматология нового поколения</div>
          <h1>Улыбка,<br />в которой <em>вы.</em></h1>
          <p>Точная стоматология с человеческим отношением. Сохраняем естественное — бережно, технологично и без спешки.</p>
          <div className="heroActions"><a className="button primary" href="#booking">Записаться на приём <b>↗</b></a><a className="textLink" href="#approach">Как мы лечим <span>↓</span></a></div>
        </div>
        <div className="visual" aria-label="Интерактивная 3D-модель зуба">
          <ToothScene />
          <span className="orbitLabel labelOne">01 / Здоровье</span>
          <span className="orbitLabel labelTwo">02 / Эстетика</span>
          <div className="quality"><b>4.9</b><div><span>★★★★★</span><small>оценка пациентов</small></div></div>
        </div>
        <div className="heroFoot"><span>Владивосток · ул. Светланская, 25</span><span>Пн—Сб · 08:00—20:00</span><span>Лицензия № ЛО-25-01-005921</span></div>
      </section>

      <section className="statement" id="approach">
        <div className="wrap statementGrid"><span className="sectionLabel">[ НАШ ПОДХОД ]</span><div><h2>Не просто лечим зубы.<br />Возвращаем <em>спокойствие.</em></h2><p>Каждый план лечения начинается с разговора. Мы объясняем варианты, показываем прогноз и принимаем решение вместе с вами.</p></div></div>
        <div className="marquee"><div>ТОЧНОСТЬ · ЗАБОТА · ЭСТЕТИКА · ТЕХНОЛОГИИ · ТОЧНОСТЬ · ЗАБОТА · ЭСТЕТИКА · ТЕХНОЛОГИИ ·</div></div>
      </section>

      <section className="services wrap" id="services">
        <div className="sectionHead"><span className="sectionLabel">[ НАПРАВЛЕНИЯ ]</span><h2>Всё необходимое.<br /><em>Ничего лишнего.</em></h2></div>
        <div className="serviceList">{services.map(s => <article key={s.n}><span>{s.n}</span><h3>{s.title}</h3><p>{s.text}</p><strong>{s.price}</strong><b>↗</b></article>)}</div>
      </section>

      <section className="numbers">
        <div className="wrap numbersGrid"><div><strong>12</strong><span>лет заботимся<br />об улыбках</span></div><div><strong>18k</strong><span>пациентов<br />доверяют нам</span></div><div><strong>96%</strong><span>лечения без<br />повторных визитов</span></div></div>
      </section>

      <section className="booking wrap" id="booking">
        <div className="bookingCopy"><span className="sectionLabel">[ ПЕРВЫЙ ШАГ ]</span><h2>Начнём<br />со <em>знакомства.</em></h2><p>Оставьте номер — координатор позвонит, ответит на вопросы и подберёт удобное время.</p></div>
        <form onSubmit={submit}>
          <label>Ваше имя<input name="name" placeholder="Как к вам обращаться?" required /></label>
          <label>Телефон<input name="phone" type="tel" placeholder="+7 (___) ___-__-__" required /></label>
          <label>Направление<select name="service" defaultValue=""><option value="" disabled>Выберите услугу</option>{services.map(s => <option key={s.n}>{s.title}</option>)}</select></label>
          <button className="button primary" disabled={loading}>{loading ? "Отправляем…" : sent ? "Заявка отправлена ✓" : "Записаться на консультацию ↗"}</button>
          <small>Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности</small>
        </form>
      </section>

      <footer id="contact"><div className="wrap footerTop"><a className="brand inverse" href="#top"><span>D</span>DentaFlow</a><h2>Улыбайтесь.<br /><em>Остальное — наше.</em></h2></div><div className="wrap footerBottom"><span>© 2026 DentaFlow</span><a href="tel:+74232012020">+7 423 201-20-20</a><a href="./admin">Панель администратора ↗</a></div></footer>
    </main>
  );
}
