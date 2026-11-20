import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const team = await prisma.teamMember.findMany({
      where: {
        isActive: true,
        isDeleted: false,
      },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ success: true, team });
  } catch (error: unknown) {
    console.error("Error fetching public team members:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
