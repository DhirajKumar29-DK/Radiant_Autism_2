import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminToken } from "@/modules/auth/auth.service";

export async function GET() {
  try {
    const gallery = await prisma.galleryItem.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ success: true, gallery });
  } catch (error: unknown) {
    console.error("Error fetching gallery items:", error);
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
    const { title, category, image, tag, isFeatured, order, isActive } = body;

    if (!title || !image) {
      return NextResponse.json(
        { success: false, error: "Title and image are required" },
        { status: 400 }
      );
    }

    const newItem = await prisma.galleryItem.create({
      data: {
        title,
        category: category || "Clinical Facility",
        image,
        tag: tag || null,
        isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : false,
        order: order ? Number(order) : 0,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return NextResponse.json({ success: true, item: newItem });
  } catch (error: unknown) {
    console.error("Error creating gallery item:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
