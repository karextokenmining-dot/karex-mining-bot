import TelegramBot from "node-telegram-bot-api";
import http from "http";

// ====== BOT TOKENİNİ BURAYA KOY KANKİ ======
const BOT_TOKEN = process.env.BOT_TOKEN || "8284256760:AAE1CMFjJZTyN6BOonubmCIsu6JtPi-0vC4";

// ====== BOTU BAŞLAT ======
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

console.log("KAREX Mining bot çalışıyor 🔥");

// ====== /start KOMUTU ======
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  const webAppUrl = "https://karexwebapp-1.onrender.com"; // BURAYA KENDİ WEBAPP LINKIN GELECEK

  bot.sendMessage(
    chatId,
    "KAREX Mining'e hoş geldin kanki! 🔥\nAşağıdaki butondan uygulamayı aç:",
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "🚀 KAREX APP'i Aç",
              web_app: { url: webAppUrl },
            },
          ],
        ],
      },
    }
  );
});

// ====== SADECE RENDER STOP ETMESİN DİYE PORT AÇIYORUZ ======
http
  .createServer((req, res) => {
    res.end("KAREX bot çalışıyor.");
  })
  .listen(process.env.PORT || 8080);
