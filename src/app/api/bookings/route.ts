import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isTimeOverlap, isValidPhone } from "@/lib/utils";

// GET /api/bookings - list bookings with optional filters
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const fieldId = searchParams.get("field");
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};
    if (date) where.date = date;
    if (fieldId) where.fieldId = fieldId;
    if (status) where.status = status;

    const bookings = await prisma.booking.findMany({
      where,
      include: { field: true },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Bookings fetch error:", error);
    return NextResponse.json(
      { error: "Bronlarni yuklashda xatolik" },
      { status: 500 }
    );
  }
}

// POST /api/bookings - create a new booking (public)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      fieldId,
      date,
      startTime,
      endTime,
      customerName,
      customerPhone,
      teamName,
      note,
    } = body;

    // Validate required fields
    if (!fieldId || !date || !startTime || !endTime || !customerName || !customerPhone) {
      return NextResponse.json(
        { error: "Barcha majburiy maydonlarni to'ldiring" },
        { status: 400 }
      );
    }

    // Validate phone
    if (!isValidPhone(customerPhone)) {
      return NextResponse.json(
        { error: "Telefon raqam noto'g'ri formatda. Masalan: +998901234567" },
        { status: 400 }
      );
    }

    // Validate field exists
    const field = await prisma.field.findUnique({ where: { id: fieldId } });
    if (!field || !field.active) {
      return NextResponse.json(
        { error: "Maydon topilmadi" },
        { status: 404 }
      );
    }

    // Check minimum advance time (30 minutes)
    const now = new Date();
    const bookingDateTime = new Date(`${date}T${startTime}:00+05:00`);
    const diffMs = bookingDateTime.getTime() - now.getTime();
    const diffMinutes = diffMs / (1000 * 60);

    if (diffMinutes < 30) {
      return NextResponse.json(
        { error: "Bron qilish uchun kamida 30 daqiqa oldin so'rov yuborish kerak" },
        { status: 400 }
      );
    }

    // Check max days ahead (30 days)
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    if (bookingDateTime > maxDate) {
      return NextResponse.json(
        { error: "Bron qilish faqat 30 kun ichida mumkin" },
        { status: 400 }
      );
    }

    // Check for overlapping bookings (conflict prevention)
    const existingBookings = await prisma.booking.findMany({
      where: {
        fieldId,
        date,
        status: { in: ["pending", "confirmed", "blocked"] },
      },
    });

    const hasConflict = existingBookings.some((b) =>
      isTimeOverlap(startTime, endTime, b.startTime, b.endTime)
    );

    if (hasConflict) {
      return NextResponse.json(
        { error: "Bu vaqt allaqachon band! Boshqa vaqtni tanlang." },
        { status: 409 }
      );
    }

    // Get pricing
    const settings = await prisma.settings.findUnique({
      where: { id: "default" },
    });

    const startHour = parseInt(startTime.split(":")[0]);
    const durationHours =
      (parseInt(endTime.split(":")[0]) * 60 + parseInt(endTime.split(":")[1]) -
        (parseInt(startTime.split(":")[0]) * 60 + parseInt(startTime.split(":")[1]))) / 60;

    const pricePerHour =
      startHour >= 18
        ? settings?.priceEvening || 300000
        : settings?.pricePerHour || 200000;

    const price = Math.round(pricePerHour * durationHours);

    // Create booking with pending status
    const booking = await prisma.booking.create({
      data: {
        fieldId,
        date,
        startTime,
        endTime,
        status: "pending",
        customerName: body.name,
        customerPhone: body.phone,
        teamName: body.teamName || "",
        note: body.note || "",
        price,
        telegramUserId: body.telegramUserId ? String(body.telegramUserId) : undefined,
        telegramUsername: body.telegramUsername,
      },
      include: { field: true },
    });

    return NextResponse.json(
      {
        message: "Bron so'rovi qabul qilindi! Admin tasdiqlashini kuting.",
        booking,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Booking create error:", error);
    return NextResponse.json(
      { error: "Bron yaratishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
