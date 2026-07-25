import { env } from "cloudflare:workers";
type TelegramEnv = { TELEGRAM_BOT_TOKEN?: string; TELEGRAM_WEBHOOK_SECRET?: string };
type TelegramUpdate = { message?: { chat?: { id?: number }; text?: string; from?: { first_name?: string } } };

export async function POST(request: Request) {
  const runtime = env as unknown as TelegramEnv;
  if (!runtime.TELEGRAM_BOT_TOKEN) return Response.json({ error: "Bot is not configured" }, { status: 503 });
  const secret = request.headers.get("x-telegram-bot-api-secret-token");
  if (runtime.TELEGRAM_WEBHOOK_SECRET && secret !== runtime.TELEGRAM_WEBHOOK_SECRET) return Response.json({ error: "Forbidden" }, { status: 403 });
  const update = await request.json() as TelegramUpdate;
  const chatId = update.message?.chat?.id;
  const command = update.message?.text?.trim().split(/\s+/)[0];
  if (!chatId || !["/start", "/admin"].includes(command || "")) return Response.json({ ok: true });
  const name = update.message?.from?.first_name;
  const origin = new URL(request.url).origin;
  const result = await fetch(`https://api.telegram.org/bot${runtime.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: name ? `Здравствуйте, ${name}! Откройте панель управления заявками DentaFlow.` : "Откройте панель управления заявками DentaFlow.", reply_markup: { inline_keyboard: [[{ text: "Открыть админку", web_app: { url: `${origin}/admin` } }]] } }),
  });
  if (!result.ok) { console.error("Telegram API error", await result.text()); return Response.json({ error: "Telegram API error" }, { status: 502 }); }
  return Response.json({ ok: true });
}
