import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const gallery = await prisma.galleryItem.findMany({
      where: {
        isActive: true,
        isDeleted: false,
      },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ success: true, gallery });
  } catch (error: unknown) {
    console.error("Error fetching public gallery items:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
