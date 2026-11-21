import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { revalidatePublicPages } from "@/lib/revalidate";

export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { isDeleted: false },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    });
    return NextResponse.json({ success: true, testimonials });
  } catch (error) {
    console.error("Error fetching admin testimonials:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch testimonials" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, role, service, image, text, rating, displayOrder, status, isActive } = body;

    if (!name || !text) {
      return NextResponse.json(
        { success: false, error: "Name and Testimonial text are required fields." },
        { status: 400 }
      );
    }

    const finalStatus = status || (isActive === false ? "INACTIVE" : "ACTIVE");
    const finalIsActive = finalStatus === "ACTIVE";

    const testimonial = await prisma.testimonial.create({
      data: {
        name: name.trim(),
        role: (role || "").trim(),
        service: (service || "").trim() || null,
        image: image || null,
        text: text.trim(),
        rating: Math.min(5, Math.max(1, parseInt(String(rating || 5), 10))),
        displayOrder: parseInt(String(displayOrder || 0), 10) || 0,
        status: finalStatus,
        isActive: finalIsActive,
        isDeleted: false,
      },
    });

    revalidatePublicPages(["/"]);

    return NextResponse.json({ success: true, testimonial }, { status: 201 });
  } catch (error) {
    console.error("Error creating testimonial:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create testimonial" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: "IDs array is required for bulk delete" },
        { status: 400 }
      );
    }

    // Soft delete
    await prisma.testimonial.updateMany({
      where: { id: { in: ids } },
      data: {
        isDeleted: true,
        isActive: false,
        status: "INACTIVE",
      },
    });

    revalidatePublicPages(["/"]);

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${ids.length} testimonial(s)`,
    });
  } catch (error) {
    console.error("Bulk delete testimonials error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to bulk delete testimonials" },
      { status: 500 }
    );
  }
}
