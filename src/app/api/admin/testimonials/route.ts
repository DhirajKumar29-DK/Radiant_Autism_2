import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
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
    const { name, role, service, image, text, rating, displayOrder, isActive } = body;

    if (!name || !text) {
      return NextResponse.json(
        { success: false, error: "Name and Testimonial text are required fields." },
        { status: 400 }
      );
    }

    const testimonial = await prisma.testimonial.create({
      data: {
        name: name.trim(),
        role: (role || "").trim(),
        service: (service || "").trim() || null,
        image: image || null,
        text: text.trim(),
        rating: Math.min(5, Math.max(1, parseInt(String(rating || 5), 10))),
        displayOrder: parseInt(String(displayOrder || 0), 10) || 0,
        isActive: isActive !== false,
      },
    });

    return NextResponse.json({ success: true, testimonial }, { status: 201 });
  } catch (error) {
    console.error("Error creating testimonial:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create testimonial" },
      { status: 500 }
    );
  }
}
