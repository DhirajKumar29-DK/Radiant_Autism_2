import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminToken } from "@/modules/auth/auth.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const service = await prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      return NextResponse.json({ success: false, error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, service });
  } catch (error: unknown) {
    console.error("Error fetching service:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

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
    const allowedFields = [
      "slug",
      "title",
      "tagline",
      "badge",
      "badgeBg",
      "iconBg",
      "bulletColor",
      "iconName",
      "image",
      "shortDescription",
      "overviewParagraphs",
      "ageGroup",
      "sessionFormat",
      "duration",
      "clinicalLead",
      "features",
      "whoNeedsThis",
      "keyBenefits",
      "faqs",
      "status",
      "isActive",
      "isDeleted",
      "order",
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (
          ["overviewParagraphs", "features", "whoNeedsThis", "keyBenefits", "faqs"].includes(
            field
          ) &&
          typeof body[field] !== "string"
        ) {
          dataToUpdate[field] = JSON.stringify(body[field]);
        } else if (field === "order") {
          dataToUpdate[field] = Number(body[field]);
        } else if (field === "status") {
          dataToUpdate.status = body.status;
          dataToUpdate.isActive = body.status === "ACTIVE";
        } else if (field === "isActive") {
          dataToUpdate.isActive = Boolean(body.isActive);
          dataToUpdate.status = body.isActive ? "ACTIVE" : "INACTIVE";
        } else if (field === "isDeleted") {
          dataToUpdate.isDeleted = Boolean(body.isDeleted);
        } else {
          dataToUpdate[field] = body[field];
        }
      }
    }

    const updatedService = await prisma.service.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, service: updatedService });
  } catch (error: unknown) {
    console.error("Error updating service:", error);
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
    await prisma.service.update({
      where: { id },
      data: {
        isDeleted: true,
        isActive: false,
        status: "INACTIVE",
      },
    });

    return NextResponse.json({ success: true, message: "Service soft deleted successfully" });
  } catch (error: unknown) {
    console.error("Error deleting service:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
