import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminToken } from "@/modules/auth/auth.service";
import { revalidatePublicPages } from "@/lib/revalidate";

export async function GET() {
  try {
    const gallery = await prisma.galleryItem.findMany({
      where: { isDeleted: false },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
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
    const { title, category, image, tag, isFeatured, order, status, isActive } = body;

    if (!title || !image) {
      return NextResponse.json(
        { success: false, error: "Title and image are required" },
        { status: 400 }
      );
    }

    const finalStatus = status || (isActive === false ? "INACTIVE" : "ACTIVE");
    const finalIsActive = finalStatus === "ACTIVE";

    const newItem = await prisma.galleryItem.create({
      data: {
        title,
        category: category || "Clinical Facility",
        image,
        tag: tag || null,
        isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : false,
        order: order ? Number(order) : 0,
        status: finalStatus,
        isActive: finalIsActive,
        isDeleted: false,
      },
    });

    revalidatePublicPages(["/", "/gallery"]);

    return NextResponse.json({ success: true, item: newItem });
  } catch (error: unknown) {
    console.error("Error creating gallery item:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get("admin_token")?.value;
    if (!token || !verifyAdminToken(token)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: "IDs array is required for bulk delete" },
        { status: 400 }
      );
    }

    // Soft delete
    await prisma.galleryItem.updateMany({
      where: { id: { in: ids } },
      data: {
        isDeleted: true,
        isActive: false,
        status: "INACTIVE",
      },
    });

    revalidatePublicPages(["/", "/gallery"]);

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${ids.length} gallery photo(s)`,
    });
  } catch (error: unknown) {
    console.error("Bulk delete gallery error:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
