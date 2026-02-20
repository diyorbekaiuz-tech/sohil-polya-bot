import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/settings - public settings
export async function GET() {
  try {
    const settings = await prisma.settings.findUnique({
      where: { id: "default" },
    });

    if (!settings) {
      return NextResponse.json(
        { error: "Sozlamalar topilmadi" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      openingTime: settings.openingTime,
      closingTime: settings.closingTime,
      slotDurations: JSON.parse(settings.slotDurations),
      pricePerHour: settings.pricePerHour,
      priceEvening: settings.priceEvening,
      contactPhone: settings.contactPhone,
      contactTelegram: settings.contactTelegram,
      locationAddress: settings.locationAddress,
      cancellationPolicy: settings.cancellationPolicy,
      currency: settings.currency,
    });
  } catch (error) {
    console.error("Settings error:", error);
    return NextResponse.json(
      { error: "Sozlamalarni yuklashda xatolik" },
      { status: 500 }
    );
  }
}
