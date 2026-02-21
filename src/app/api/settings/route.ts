import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// Disable Vercel caching - always return fresh data
export const dynamic = 'force-dynamic';

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

// PUT /api/settings - update settings (admin only)
export async function PUT(req: NextRequest) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  try {
    const body = await req.json();

    const updated = await prisma.settings.update({
      where: { id: "default" },
      data: {
        openingTime: body.openingTime,
        closingTime: body.closingTime,
        pricePerHour: body.pricePerHour,
        priceEvening: body.priceEvening,
        contactPhone: body.contactPhone,
        contactTelegram: body.contactTelegram,
        locationAddress: body.locationAddress,
        cancellationPolicy: body.cancellationPolicy,
      },
    });

    return NextResponse.json({ success: true, settings: updated });
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json(
      { error: "Sozlamalarni saqlashda xatolik" },
      { status: 500 }
    );
  }
}
