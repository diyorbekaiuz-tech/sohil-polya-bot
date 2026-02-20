import { Bot, InlineKeyboard } from "grammy";
import dotenv from "dotenv";

dotenv.config();

const token = process.env.BOT_TOKEN;

if (!token) {
  console.error("❌ BOT_TOKEN topilmadi! .env fayliga BOT_TOKEN qo'shing.");
  process.exit(1);
}

const bot = new Bot(token);

bot.command("start", async (ctx) => {
  const keyboard = new InlineKeyboard().webApp(
    "⚽ Chim Bronni ochish",
    process.env.WEBAPP_URL || "https://example.com"
  );

  await ctx.reply(
    "Assalomu alaykum! Chim Bron tizimiga xush kelibsiz.\n\nQuyidagi tugmani bosib maydonlarni bron qilishingiz mumkin:",
    { reply_markup: keyboard }
  );
});

bot.start();
console.log("🤖 Bot ishga tushdi...");
