import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminToken } from "@/modules/auth/auth.service";

export async function GET() {
  try {
    const team = await prisma.teamMember.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });

    return NextResponse.json({ success: true, team });
  } catch (error: unknown) {
    console.error("Error fetching team members:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("admin_token")?.value;
    if (!token || !verifyAdminToken(token)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, role, badge, image, bio, instagram, order, isActive } = body;

    if (!name || !role) {
      return NextResponse.json(
        { success: false, error: "Name and role are required" },
        { status: 400 }
      );
    }

    const newMember = await prisma.teamMember.create({
      data: {
        name,
        role,
        badge: badge || "Clinical Specialist",
        image: image || "/founder_portrait.jpg",
        bio: bio || null,
        instagram: instagram || null,
        order: order ? Number(order) : 0,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return NextResponse.json({ success: true, teamMember: newMember });
  } catch (error: unknown) {
    console.error("Error creating team member:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
