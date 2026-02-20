import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create 3 fields
  const fields = [
    {
      id: "field_1",
      name: "Maydon 1",
      surface: "sun'iy chim",
      description: "Chapki maydon — 40x20m",
      order: 1,
      active: true,
    },
    {
      id: "field_2",
      name: "Maydon 2",
      surface: "sun'iy chim",
      description: "O'rtadagi maydon — 40x20m",
      order: 2,
      active: true,
    },
    {
      id: "field_3",
      name: "Maydon 3",
      surface: "sun'iy chim",
      description: "O'ngdagi maydon — 40x20m",
      order: 3,
      active: true,
    },
  ];

  for (const field of fields) {
    await prisma.field.upsert({
      where: { id: field.id },
      update: field,
      create: field,
    });
    console.log(`  ✅ ${field.name} yaratildi`);
  }

  // Create default settings
  await prisma.settings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      openingTime: "06:00",
      closingTime: "24:00",
      slotDurations: "[60,120]",
      pricePerHour: 200000,
      priceEvening: 300000,
      contactPhone: "+998901234567",
      contactTelegram: "@chim_admin",
      locationAddress: "Toshkent shahri",
      cancellationPolicy:
        "Bronni bekor qilish uchun kamida 2 soat oldin xabar bering.",
    },
  });
  console.log("  ✅ Sozlamalar yaratildi");

  // Create a few sample bookings for today
  const today = new Date().toISOString().split("T")[0];
  const sampleBookings = [
    {
      fieldId: "field_1",
      date: today,
      startTime: "10:00",
      endTime: "11:00",
      status: "confirmed",
      customerName: "Anvar Toshmatov",
      customerPhone: "+998901234567",
      teamName: "FC Spartak",
      price: 200000,
    },
    {
      fieldId: "field_2",
      date: today,
      startTime: "14:00",
      endTime: "16:00",
      status: "confirmed",
      customerName: "Bobur Karimov",
      customerPhone: "+998901234568",
      teamName: "FC Lokomotiv",
      price: 400000,
    },
    {
      fieldId: "field_1",
      date: today,
      startTime: "18:00",
      endTime: "19:00",
      status: "pending",
      customerName: "Sardor Aliyev",
      customerPhone: "+998901234569",
      price: 300000,
    },
    {
      fieldId: "field_3",
      date: today,
      startTime: "20:00",
      endTime: "22:00",
      status: "blocked",
      blockReason: "Turnir",
      price: 0,
    },
  ];

  for (const booking of sampleBookings) {
    await prisma.booking.create({ data: booking });
  }
  console.log(`  ✅ ${sampleBookings.length} ta namuna bron yaratildi`);

  console.log("\n🎉 Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
