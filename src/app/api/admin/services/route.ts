import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminToken } from "@/modules/auth/auth.service";
import { revalidatePublicPages } from "@/lib/revalidate";

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      where: { isDeleted: false },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });

    return NextResponse.json({ success: true, services });
  } catch (error: unknown) {
    console.error("Error fetching services:", error);
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
    const {
      slug,
      title,
      tagline,
      badge,
      badgeBg,
      iconBg,
      bulletColor,
      iconName,
      image,
      shortDescription,
      overviewParagraphs,
      ageGroup,
      sessionFormat,
      duration,
      clinicalLead,
      features,
      whoNeedsThis,
      keyBenefits,
      clinicalProcess,
      faqs,
      status,
      isActive,
      order,
    } = body;

    if (!slug || !title) {
      return NextResponse.json(
        { success: false, error: "Title and slug are required" },
        { status: 400 }
      );
    }

    // Clean slug
    const cleanSlug = slug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-");

    const existing = await prisma.service.findUnique({
      where: { slug: cleanSlug },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: `A service with slug "${cleanSlug}" already exists.` },
        { status: 409 }
      );
    }

    const finalStatus = status || (isActive === false ? "INACTIVE" : "ACTIVE");
    const finalIsActive = finalStatus === "ACTIVE";

    const newService = await prisma.service.create({
      data: {
        slug: cleanSlug,
        title,
        tagline: tagline || null,
        badge: badge || "Clinical Care",
        badgeBg: badgeBg || "bg-blue-600",
        iconBg: iconBg || "bg-blue-600",
        bulletColor: bulletColor || "text-blue-600",
        iconName: iconName || "Brain",
        image: image ? image.trim() : null,
        shortDescription: shortDescription || null,
        overviewParagraphs:
          typeof overviewParagraphs === "string"
            ? overviewParagraphs
            : JSON.stringify(overviewParagraphs || []),
        ageGroup: ageGroup || "2 to 20 Years",
        sessionFormat: sessionFormat || "1:1 Individualized Sessions",
        duration: duration || "Customized Care Plan",
        clinicalLead: clinicalLead || "Registered Clinical Team",
        features:
          typeof features === "string" ? features : JSON.stringify(features || []),
        whoNeedsThis:
          typeof whoNeedsThis === "string" ? whoNeedsThis : JSON.stringify(whoNeedsThis || {}),
        keyBenefits:
          typeof keyBenefits === "string" ? keyBenefits : JSON.stringify(keyBenefits || []),
        clinicalProcess:
          typeof clinicalProcess === "string" ? clinicalProcess : JSON.stringify(clinicalProcess || []),
        faqs: typeof faqs === "string" ? faqs : JSON.stringify(faqs || []),
        status: finalStatus,
        isActive: finalIsActive,
        isDeleted: false,
        order: order ? Number(order) : 0,
      },
    });

    revalidatePublicPages(["/", "/services"]);

    return NextResponse.json({ success: true, service: newService });
  } catch (error: unknown) {
    console.error("Error creating service:", error);
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
    await prisma.service.updateMany({
      where: { id: { in: ids } },
      data: {
        isDeleted: true,
        isActive: false,
        status: "INACTIVE",
      },
    });

    revalidatePublicPages(["/", "/services"]);

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${ids.length} clinical service(s)`,
    });
  } catch (error: unknown) {
    console.error("Bulk delete services error:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
