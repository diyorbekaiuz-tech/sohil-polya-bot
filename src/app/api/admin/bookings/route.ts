import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// GET /api/admin/bookings - list bookings with full admin filters
export async function GET(req: NextRequest) {
  const authError = requireAdmin(req);
  if (authError) return authError;

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
      orderBy: [{ date: "desc" }, { startTime: "asc" }],
    });

    // Get stats
    const today = new Date().toISOString().split("T")[0];
    const todayBookings = await prisma.booking.count({
      where: { date: today, status: { in: ["confirmed", "pending"] } },
    });
    const pendingCount = await prisma.booking.count({
      where: { status: "pending" },
    });
    const confirmedToday = await prisma.booking.count({
      where: { date: today, status: "confirmed" },
    });

    return NextResponse.json({
      bookings,
      stats: {
        todayBookings,
        pendingCount,
        confirmedToday,
      },
    });
  } catch (error) {
    console.error("Admin bookings error:", error);
    return NextResponse.json(
      { error: "Bronlarni yuklashda xatolik" },
      { status: 500 }
    );
  }
}

// POST /api/admin/bookings - admin creates a booking directly
export async function POST(req: NextRequest) {
  const authError = requireAdmin(req);
  if (authError) return authError;

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
      status,
      price,
    } = body;

    if (!fieldId || !date || !startTime || !endTime) {
      return NextResponse.json(
        { error: "Barcha majburiy maydonlarni to'ldiring" },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.create({
      data: {
        fieldId,
        date,
        startTime,
        endTime,
        status: status || "confirmed",
        customerName: customerName || "",
        customerPhone: customerPhone || "",
        teamName: teamName || "",
        note: note || "",
        price: price || 0,
      },
      include: { field: true },
    });

    return NextResponse.json(
      { message: "Bron yaratildi", booking },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin booking create error:", error);
    return NextResponse.json(
      { error: "Bron yaratishda xatolik" },
      { status: 500 }
    );
  }
}
