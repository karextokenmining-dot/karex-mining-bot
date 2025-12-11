import TelegramBot from "node-telegram-bot-api";

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

const balances = {}; // kullanıcı bakiyeleri

bot.on("message", (msg) => {
  const chatId = msg.chat.id;

  if (!balances[chatId]) balances[chatId] = 0;

  bot.sendMessage(
    chatId,
    "🔥 *KAREX Mining Bot*\n\n" +
    "⛏ Kazım başladı! Her tıkladığında +1 KAREX kazanırsın.\n\n" +
    "👉 /mine – Kazım yap\n" +
    "👉 /balance – Bakiye görüntüle",
    { parseMode: "Markdown" }
  );
});

bot.onText(/\/mine/, (msg) => {
  const chatId = msg.chat.id;
  if (!balances[chatId]) balances[chatId] = 0;
  balances[chatId] += 1;

  bot.sendMessage(chatId, `⛏ +1 KAREX kazdın!\n💰 Toplam: ${balances[chatId]}`);
});

bot.onText(/\/balance/, (msg) => {
  const chatId = msg.chat.id;
  const bal = balances[chatId] || 0;

  bot.sendMessage(chatId, `💰 *Bakiyen:* ${bal} KAREX`, {
    parseMode: "Markdown",
  });
});

console.log("KAREX Mining bot çalışıyor 🔥");
