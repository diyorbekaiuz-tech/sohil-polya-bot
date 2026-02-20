const { Bot, InlineKeyboard } = require("grammy");
require("dotenv").config();

const token = process.env.BOT_TOKEN;

if (!token) {
  console.error("❌ BOT_TOKEN topilmadi! .env fayliga BOT_TOKEN qo'shing.");
  process.exit(1);
}

const bot = new Bot(token);

bot.command("start", async (ctx) => {
  const webAppUrl = process.env.WEBAPP_URL || "https://example.com";
  const keyboard = new InlineKeyboard().webApp(
    "⚽ Chim Bronni ochish",
    webAppUrl
  );

  await ctx.reply(
    "Assalomu alaykum! Chim Bron tizimiga xush kelibsiz.\n\nQuyidagi tugmani bosib maydonlarni bron qilishingiz mumkin:",
    { reply_markup: keyboard }
  );
});

bot.command("admin", async (ctx) => {
  const webAppUrl = process.env.WEBAPP_URL || "https://example.com";
  const keyboard = new InlineKeyboard().webApp(
    "🔐 Admin panelni ochish",
    webAppUrl + "/admin/login"
  );

  await ctx.reply("Admin paneliga kirish:", { reply_markup: keyboard });
});

bot.start();
console.log("🤖 Bot ishga tushdi...");
