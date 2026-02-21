import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateTimeSlots, isTimeOverlap } from "@/lib/utils";

// Disable Vercel caching
export const dynamic = 'force-dynamic';

// Helper: get next day date string (YYYY-MM-DD)
function getNextDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

// Helper: check if schedule crosses midnight
function isPastMidnight(openingTime: string, closingTime: string): boolean {
  const [openH, openM] = openingTime.split(":").map(Number);
  const [closeH, closeM] = closingTime.split(":").map(Number);
  return (closeH * 60 + closeM) <= (openH * 60 + openM);
}

// Helper: check if a slot time is in the "next day" portion (past midnight)
function isNextDaySlot(slotStart: string, openingTime: string, closingTime: string): boolean {
  if (!isPastMidnight(openingTime, closingTime)) return false;
  const [slotH] = slotStart.split(":").map(Number);
  const [closeH] = closingTime.split(":").map(Number);
  // Slot is on next day if its hour is less than closing hour (the past-midnight portion)
  return slotH < closeH || (slotH === closeH);
}

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
    const crossesMidnight = isPastMidnight(openingTime, closingTime);
    const nextDate = getNextDate(date);

    // Get all fields
    const fields = await prisma.field.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
    });

    // Build where clause - fetch bookings for selected date
    const fieldFilter = fieldId ? { fieldId } : {};

    // Fetch bookings for current date AND next date (for past-midnight slots)
    const datesToFetch = [date];
    if (crossesMidnight) datesToFetch.push(nextDate);

    const bookings = await prisma.booking.findMany({
      where: {
        date: { in: datesToFetch },
        status: { in: ["pending", "confirmed", "blocked"] },
        ...fieldFilter,
      },
    });

    // Generate 1-hour time slots
    const slots = generateTimeSlots(openingTime, closingTime, 60);

    // Build availability for each field
    const availability = fields
      .filter((f) => !fieldId || f.id === fieldId)
      .map((field) => {
        const fieldBookings = bookings.filter((b) => b.fieldId === field.id);

        const timeSlots = slots.map((slot) => {
          // Determine which date this slot belongs to
          const slotIsNextDay = isNextDaySlot(slot.start, openingTime, closingTime);
          const slotDate = slotIsNextDay ? nextDate : date;

          // Check if this slot overlaps with any booking on the correct date
          const overlappingBooking = fieldBookings.find((b) => {
            if (b.date !== slotDate) return false;
            return isTimeOverlap(slot.start, slot.end, b.startTime, b.endTime);
          });

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
            actualDate: slotDate, // The real date this slot belongs to
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
