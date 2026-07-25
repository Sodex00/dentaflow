# DentaFlow

Портфолио-проект цифровой стоматологии: светлый имиджевый лендинг, интерактивная WebGL-сцена и Telegram Mini App для обработки заявок.

![DentaFlow social preview](public/og.png)

## Концепция

DentaFlow объединяет ощущение современной клиники и спокойного digital-сервиса. Визуальный язык построен на клиническом белом, холодной мяте, глубоком зелёном и редакционной типографике. Вместо типовой фотографии врача в первом экране используется интерактивный WebGL-объект «цифровая эмаль».

## Возможности

- адаптивный лендинг стоматологии;
- интерактивная WebGL-сцена без тяжёлой 3D-библиотеки;
- форма записи с валидацией и сохранением в Cloudflare D1;
- Telegram Mini App с разделами «Новые» и «Принятые»;
- принятие заявки и назначение времени визита;
- доступ администраторов по списку Telegram `@username`;
- серверная проверка подписи Telegram `initData`;
- локальный Telegram-бот через long polling для portfolio-demo;
- Telegram webhook для опубликованной версии.

## Стек

`React 19` · `TypeScript` · `Node.js` · `Vinext / Next App Router` · `Cloudflare Workers` · `D1` · `WebGL` · `Telegram Bot API`

## Локальный запуск

Требуется Node.js `22.13+`.

```bash
npm install
cp .env.example .env.local
npm run dev
```

- Лендинг: `http://localhost:3000`
- Админка: `http://localhost:3000/admin`

### Telegram-бот для разработки

Заполните `.env.local`, затем в отдельном терминале запустите:

```bash
npm run bot:dev
```

Для запуска Mini App внутри Telegram значение `MINI_APP_URL` должно быть публичным HTTPS-адресом. Локальный polling-процесс не требует webhook.

## Переменные окружения

```env
TELEGRAM_BOT_TOKEN=token_from_botfather
TELEGRAM_WEBHOOK_SECRET=random_secret
ADMIN_USERNAMES=@admin_one,@admin_two
DEMO_MODE=false
MINI_APP_URL=https://your-public-url/admin
```

Не добавляйте `.env.local` и токен бота в Git.

## GitHub Codespaces

1. Создайте Codespace из репозитория.
2. Запустите `npm run dev`.
3. Во вкладке **Ports** переключите порт `3000` в режим **Public**.
4. Используйте выданный адрес `https://…-3000.app.github.dev/admin` как `MINI_APP_URL`.

Codespaces подходит для временной демонстрации: остановленный Codespace перестаёт обслуживать Mini App.

## Проверка сборки

```bash
npm run build
```

## Структура

```text
app/
  admin/                 Telegram Mini App UI
  api/requests/          публичная форма заявки
  api/admin/requests/    защищённый CRM API
  api/telegram/webhook/  webhook Telegram-бота
  components/ToothScene WebGL-сцена
db/                      схема D1
scripts/                 локальный polling-бот
```

---

Designed and developed as a portfolio case study.
