import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, role, service, image, text, rating, displayOrder, status, isActive, isDeleted } = body;

    const dataToUpdate: any = {};
    if (name !== undefined) dataToUpdate.name = name.trim();
    if (role !== undefined) dataToUpdate.role = (role || "").trim();
    if (service !== undefined) dataToUpdate.service = (service || "").trim() || null;
    if (image !== undefined) dataToUpdate.image = image || null;
    if (text !== undefined) dataToUpdate.text = text.trim();
    if (rating !== undefined) dataToUpdate.rating = Math.min(5, Math.max(1, parseInt(String(rating || 5), 10)));
    if (displayOrder !== undefined) dataToUpdate.displayOrder = parseInt(String(displayOrder || 0), 10) || 0;
    
    if (status !== undefined) {
      dataToUpdate.status = status;
      dataToUpdate.isActive = status === "ACTIVE";
    } else if (isActive !== undefined) {
      dataToUpdate.isActive = Boolean(isActive);
      dataToUpdate.status = isActive ? "ACTIVE" : "INACTIVE";
    }

    if (isDeleted !== undefined) dataToUpdate.isDeleted = Boolean(isDeleted);

    const updated = await prisma.testimonial.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, testimonial: updated });
  } catch (error) {
    console.error("Error updating testimonial:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update testimonial" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Soft delete
    await prisma.testimonial.update({
      where: { id },
      data: {
        isDeleted: true,
        isActive: false,
        status: "INACTIVE",
      },
    });

    return NextResponse.json({ success: true, message: "Testimonial soft deleted successfully" });
  } catch (error) {
    console.error("Error deleting testimonial:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete testimonial" },
      { status: 500 }
    );
  }
}
