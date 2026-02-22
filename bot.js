const { Bot, InlineKeyboard, Keyboard } = require("grammy");
require("dotenv").config();

const token = process.env.BOT_TOKEN;

if (!token) {
  console.error("❌ BOT_TOKEN topilmadi! .env fayliga BOT_TOKEN qo'shing.");
  process.exit(1);
}

    const http = require("http");
    const port = process.env.PORT || 8000;
    http.createServer((req, res) => {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.write("Bot is running!");
      res.end();
    }).listen(port, () => {
      console.log(`🌐 Dummy Web Server is listening on port ${port} (for Koyeb Health Check)`);
    });

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
    `✅ Rahmat! Telefon raqamingiz: ${phone}`,
    { reply_markup: { remove_keyboard: true } }
  );

  await ctx.reply(
    "Quyidagi tugmani bosib maydonlarni bron qilishingiz mumkin:",
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

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Add reminder loop running every 1 minute
setInterval(async () => {
  try {
    const now = new Date();
    // Get all confirmed bookings that have a telegramUserId and haven't had a reminder sent
    const upcomingBookings = await prisma.booking.findMany({
      where: {
        status: "confirmed",
        reminderSent: false,
        telegramUserId: { not: null },
      },
      include: { field: true }
    });

    for (const booking of upcomingBookings) {
      if (!booking.telegramUserId) continue; // safety check
      
      const bookingDateTime = new Date(`${booking.date}T${booking.startTime}:00+05:00`);
      const diffMs = bookingDateTime.getTime() - now.getTime();
      const diffMinutes = Math.floor(diffMs / 60000);

      // If booking is within the next 90 minutes and not in the past
      if (diffMinutes <= 90 && diffMinutes > 0) {
        const text = `⏳ *Eslatma!*\n\nSiz futbol maydoni bron qilgansiz. O'yin boshlanishiga taxminan 1 soat va 30 daqiqa qoldi.\n\n📅 Sana: ${booking.date}\n⏰ Vaqt: ${booking.startTime} - ${booking.endTime}\n🏟 Maydon: ${booking.field.name}\n\nIltimos, o'z vaqtida yetib keling.`;
        
        try {
          await bot.api.sendMessage(booking.telegramUserId, text, { parse_mode: "Markdown" });
          
          // Mark as sent
          await prisma.booking.update({
            where: { id: booking.id },
            data: { reminderSent: true }
          });
          console.log(`Reminder sent to ${booking.telegramUserId} for booking ${booking.id}`);
        } catch (error) {
          console.error(`Failed to send reminder for booking ${booking.id}:`, error.message);
        }
      }
    }
  } catch (error) {
    console.error("Error in reminder cron:", error.message);
  }
}, 60 * 1000);

bot.start();
console.log("🤖 Bot ishga tushdi...");
