import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/modules/auth/auth.service";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("admin_token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    const payload = verifyAdminToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, error: "Invalid or expired token" }, { status: 401 });
    }

    const admin = await prisma.admin.findUnique({
      where: { id: payload.adminId },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!admin) {
      return NextResponse.json({ success: false, error: "Admin not found" }, { status: 401 });
    }

    return NextResponse.json({ success: true, admin });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error verifying authentication.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
