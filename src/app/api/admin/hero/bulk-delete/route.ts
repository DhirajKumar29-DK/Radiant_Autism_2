import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminToken } from "@/modules/auth/auth.service";
import { revalidatePublicPages } from "@/lib/revalidate";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("admin_token")?.value;
    if (!token || !verifyAdminToken(token)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, error: "No slide IDs provided" }, { status: 400 });
    }

    await prisma.hero.deleteMany({
      where: { id: { in: ids } },
    });

    revalidatePublicPages();

    return NextResponse.json({ success: true, message: `Successfully deleted ${ids.length} slides` });
  } catch (error: unknown) {
    console.error("Error bulk deleting heroes:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
