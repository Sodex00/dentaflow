const token = process.env.TELEGRAM_BOT_TOKEN;
const adminUrl = process.env.MINI_APP_URL || "http://127.0.0.1:3000/admin";

if (!token) {
  console.error("TELEGRAM_BOT_TOKEN не найден в .env.local");
  process.exit(1);
}

const api = async (method, body = {}) => {
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const result = await response.json();
  if (!result.ok) throw new Error(result.description || `Telegram API: ${method}`);
  return result.result;
};

await api("deleteWebhook", { drop_pending_updates: true });
const me = await api("getMe");
console.log(`Бот @${me.username} запущен. Отправьте ему /start или /admin`);

let offset = 0;
let stopped = false;
process.on("SIGINT", () => { stopped = true; console.log("\nБот остановлен"); });

while (!stopped) {
  try {
    const updates = await api("getUpdates", { offset, timeout: 25, allowed_updates: ["message"] });
    for (const update of updates) {
      offset = update.update_id + 1;
      const message = update.message;
      const command = message?.text?.trim().split(/\s+/)[0];
      if (!message?.chat?.id || !["/start", "/admin"].includes(command)) continue;
      const button = adminUrl.startsWith("https://")
        ? { text: "Открыть админку", web_app: { url: adminUrl } }
        : { text: "Открыть админку", url: adminUrl };
      await api("sendMessage", {
        chat_id: message.chat.id,
        text: `Здравствуйте${message.from?.first_name ? `, ${message.from.first_name}` : ""}! Откройте панель управления заявками DentaFlow.`,
        reply_markup: { inline_keyboard: [[button]] },
      });
    }
  } catch (error) {
    console.error("Ошибка polling:", error.message);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}
