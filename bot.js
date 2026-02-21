const { Bot, InlineKeyboard, Keyboard } = require("grammy");
require("dotenv").config();

const token = process.env.BOT_TOKEN;

if (!token) {
  console.error("❌ BOT_TOKEN topilmadi! .env fayliga BOT_TOKEN qo'shing.");
  process.exit(1);
}

const bot = new Bot(token);

// /start - request phone number first
bot.command("start", async (ctx) => {
  const keyboard = new Keyboard()
    .requestContact("📞 Telefon raqamni ulashish")
    .resized()
    .oneTime();

  await ctx.reply(
    "Assalomu alaykum! Chim Bron tizimiga xush kelibsiz.\n\n📱 Bron qilish uchun avval telefon raqamingizni ulashing:",
    { reply_markup: keyboard }
  );
});

// Handle shared contact - show WebApp with phone
bot.on("message:contact", async (ctx) => {
  const contact = ctx.message.contact;
  let phone = contact.phone_number;

  // Normalize phone format
  if (!phone.startsWith("+")) phone = "+" + phone;

  const webAppUrl = process.env.WEBAPP_URL || "https://example.com";
  const keyboard = new InlineKeyboard().webApp(
    "⚽ Chim Bronni ochish",
    webAppUrl + "?phone=" + encodeURIComponent(phone)
  );

  await ctx.reply(
    `✅ Rahmat! Telefon raqamingiz: ${phone}\n\nQuyidagi tugmani bosib maydonlarni bron qilishingiz mumkin:`,
    { reply_markup: keyboard }
  );
});

// /admin - open admin panel
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
