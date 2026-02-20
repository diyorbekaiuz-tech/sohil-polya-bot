import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { isTimeOverlap } from "@/lib/utils";

// POST /api/admin/blocked - block a time slot
export async function POST(req: NextRequest) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const { fieldId, date, startTime, endTime, reason } = body;

    if (!fieldId || !date || !startTime || !endTime) {
      return NextResponse.json(
        { error: "Barcha maydonlarni to'ldiring" },
        { status: 400 }
      );
    }

    // Check for conflicts
    const existing = await prisma.booking.findMany({
      where: {
        fieldId,
        date,
        status: { in: ["pending", "confirmed", "blocked"] },
      },
    });

    const hasConflict = existing.some((b) =>
      isTimeOverlap(startTime, endTime, b.startTime, b.endTime)
    );

    if (hasConflict) {
      return NextResponse.json(
        { error: "Bu vaqtda boshqa bron mavjud" },
        { status: 409 }
      );
    }

    const blocked = await prisma.booking.create({
      data: {
        fieldId,
        date,
        startTime,
        endTime,
        status: "blocked",
        blockReason: reason || "Yopiq",
        customerName: "Admin",
        customerPhone: "",
        price: 0,
      },
      include: { field: true },
    });

    return NextResponse.json(
      { message: "Vaqt bloklandi", booking: blocked },
      { status: 201 }
    );
  } catch (error) {
    console.error("Block time error:", error);
    return NextResponse.json(
      { error: "Vaqtni bloklashda xatolik" },
      { status: 500 }
    );
  }
}
