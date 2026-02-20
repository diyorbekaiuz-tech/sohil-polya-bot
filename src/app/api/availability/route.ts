import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateTimeSlots, isTimeOverlap } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const fieldId = searchParams.get("field");

    if (!date) {
      return NextResponse.json(
        { error: "Sana kiritilishi shart (date=YYYY-MM-DD)" },
        { status: 400 }
      );
    }

    // Get settings for time slots
    const settings = await prisma.settings.findUnique({
      where: { id: "default" },
    });

    const openingTime = settings?.openingTime || "06:00";
    const closingTime = settings?.closingTime || "24:00";

    // Get all fields
    const fields = await prisma.field.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
    });

    // Get all bookings for the date
    const whereClause: Record<string, unknown> = {
      date,
      status: { in: ["pending", "confirmed", "blocked"] },
    };
    if (fieldId) {
      whereClause.fieldId = fieldId;
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
    });

    // Generate 1-hour time slots
    const slots = generateTimeSlots(openingTime, closingTime, 60);

    // Build availability for each field
    const availability = fields
      .filter((f) => !fieldId || f.id === fieldId)
      .map((field) => {
        const fieldBookings = bookings.filter((b) => b.fieldId === field.id);

        const timeSlots = slots.map((slot) => {
          // Check if this slot overlaps with any booking
          const overlappingBooking = fieldBookings.find((b) =>
            isTimeOverlap(slot.start, slot.end, b.startTime, b.endTime)
          );

          let status = "free";
          let booking = null;

          if (overlappingBooking) {
            status = overlappingBooking.status;
            booking = {
              id: overlappingBooking.id,
              customerName: overlappingBooking.customerName,
              startTime: overlappingBooking.startTime,
              endTime: overlappingBooking.endTime,
              status: overlappingBooking.status,
              blockReason: overlappingBooking.blockReason,
            };
          }

          return {
            start: slot.start,
            end: slot.end,
            status,
            booking,
          };
        });

        return {
          field: {
            id: field.id,
            name: field.name,
            surface: field.surface,
            description: field.description,
          },
          slots: timeSlots,
        };
      });

    return NextResponse.json({
      date,
      openingTime,
      closingTime,
      settings: {
        pricePerHour: settings?.pricePerHour || 200000,
        priceEvening: settings?.priceEvening || 300000,
        slotDurations: JSON.parse(settings?.slotDurations || "[60,120]"),
        currency: settings?.currency || "UZS",
      },
      availability,
    });
  } catch (error) {
    console.error("Availability error:", error);
    return NextResponse.json(
      { error: "Mavjudlikni tekshirishda xatolik" },
      { status: 500 }
    );
  }
}
