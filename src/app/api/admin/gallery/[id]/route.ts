import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminToken } from "@/modules/auth/auth.service";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get("admin_token")?.value;
    if (!token || !verifyAdminToken(token)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const dataToUpdate: any = {};
    if (body.title !== undefined) dataToUpdate.title = body.title;
    if (body.category !== undefined) dataToUpdate.category = body.category;
    if (body.image !== undefined) dataToUpdate.image = body.image;
    if (body.tag !== undefined) dataToUpdate.tag = body.tag;
    if (body.isFeatured !== undefined) dataToUpdate.isFeatured = Boolean(body.isFeatured);
    if (body.order !== undefined) dataToUpdate.order = Number(body.order);
    
    if (body.status !== undefined) {
      dataToUpdate.status = body.status;
      dataToUpdate.isActive = body.status === "ACTIVE";
    } else if (body.isActive !== undefined) {
      dataToUpdate.isActive = Boolean(body.isActive);
      dataToUpdate.status = body.isActive ? "ACTIVE" : "INACTIVE";
    }

    if (body.isDeleted !== undefined) dataToUpdate.isDeleted = Boolean(body.isDeleted);

    const updated = await prisma.galleryItem.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, item: updated });
  } catch (error: unknown) {
    console.error("Error updating gallery item:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get("admin_token")?.value;
    if (!token || !verifyAdminToken(token)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    // Soft delete
    await prisma.galleryItem.update({
      where: { id },
      data: {
        isDeleted: true,
        isActive: false,
        status: "INACTIVE",
      },
    });

    return NextResponse.json({ success: true, message: "Gallery item soft deleted successfully" });
  } catch (error: unknown) {
    console.error("Error deleting gallery item:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
