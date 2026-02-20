import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { isTimeOverlap } from "@/lib/utils";

// PATCH /api/admin/bookings/[id] - update booking status or reschedule
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check admin auth
  const authError = requireAdmin(req);
  if (authError) return authError;

  try {
    const { id } = params;
    const body = await req.json();
    const { status, startTime, endTime, fieldId, date, note, price } = body;

    // Verify booking exists
    const existing = await prisma.booking.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Bron topilmadi" },
        { status: 404 }
      );
    }

    // If rescheduling, check for conflicts
    const newFieldId = fieldId || existing.fieldId;
    const newDate = date || existing.date;
    const newStartTime = startTime || existing.startTime;
    const newEndTime = endTime || existing.endTime;

    if (startTime || endTime || fieldId || date) {
      const overlapping = await prisma.booking.findMany({
        where: {
          fieldId: newFieldId,
          date: newDate,
          status: { in: ["pending", "confirmed", "blocked"] },
          id: { not: id },
        },
      });

      const hasConflict = overlapping.some((b) =>
        isTimeOverlap(newStartTime, newEndTime, b.startTime, b.endTime)
      );

      if (hasConflict) {
        return NextResponse.json(
          { error: "Bu vaqt allaqachon band! Boshqa vaqtni tanlang." },
          { status: 409 }
        );
      }
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (startTime) updateData.startTime = startTime;
    if (endTime) updateData.endTime = endTime;
    if (fieldId) updateData.fieldId = fieldId;
    if (date) updateData.date = date;
    if (note !== undefined) updateData.note = note;
    if (price !== undefined) updateData.price = price;

    const updated = await prisma.booking.update({
      where: { id },
      data: updateData,
      include: { field: true },
    });

    return NextResponse.json({
      message: "Bron yangilandi",
      booking: updated,
    });
  } catch (error) {
    console.error("Booking update error:", error);
    return NextResponse.json(
      { error: "Bronni yangilashda xatolik" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/bookings/[id] - delete a booking
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  try {
    await prisma.booking.delete({ where: { id: params.id } });
    return NextResponse.json({ message: "Bron o'chirildi" });
  } catch (error) {
    console.error("Booking delete error:", error);
    return NextResponse.json(
      { error: "Bronni o'chirishda xatolik" },
      { status: 500 }
    );
  }
}
