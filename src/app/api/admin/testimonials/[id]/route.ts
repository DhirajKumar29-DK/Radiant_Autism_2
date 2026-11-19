import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, role, service, image, text, rating, displayOrder, isActive } = body;

    if (!name || !text) {
      return NextResponse.json(
        { success: false, error: "Name and Testimonial text are required fields." },
        { status: 400 }
      );
    }

    const updated = await prisma.testimonial.update({
      where: { id },
      data: {
        name: name.trim(),
        role: (role || "").trim(),
        service: (service || "").trim() || null,
        image: image || null,
        text: text.trim(),
        rating: Math.min(5, Math.max(1, parseInt(String(rating || 5), 10))),
        displayOrder: parseInt(String(displayOrder || 0), 10) || 0,
        isActive: Boolean(isActive),
      },
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
    await prisma.testimonial.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Testimonial deleted successfully" });
  } catch (error) {
    console.error("Error deleting testimonial:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete testimonial" },
      { status: 500 }
    );
  }
}
