import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const fields = await prisma.field.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(fields);
  } catch (error) {
    console.error("Fields fetch error:", error);
    return NextResponse.json(
      { error: "Maydonlarni yuklashda xatolik" },
      { status: 500 }
    );
  }
}
