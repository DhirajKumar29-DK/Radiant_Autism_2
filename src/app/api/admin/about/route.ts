import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminToken } from "@/modules/auth/auth.service";
import { revalidatePublicPages } from "@/lib/revalidate";

export async function GET() {
  try {
    let about = await prisma.aboutSection.findFirst();

    if (!about) {
      about = await prisma.aboutSection.create({
        data: {
          badgeText: "ABOUT RADIANT AUTISM & SKILL CENTER",
          title: "Dedicated Clinical Support for Every Child's Unique Potential",
          description1:
            "Radiant Autism & Skill Center is a multidisciplinary pediatric clinic dedicated to delivering research-backed, compassionate developmental therapies.",
          description2:
            "Supervised by our Registered Behaviour Analyst (RBA, Ontario), our team collaborates closely with families to establish individualized milestones.",
          centerImage: "/about_center_photo.jpg",
          highlightsJson: JSON.stringify([
            "100% RBA Supervised Clinical Programs",
            "Eligible for Ontario Autism Program (OAP) funding",
            "Individualized 1:1 and peer-group social rooms",
            "Family-centered progress reporting and collaboration",
          ]),
          facilityHeading: "Modern Sensory-Rich Clinical Environment",
          facilityDesc:
            "Our clinic features custom sensory gyms, private 1:1 intervention suites, gross-motor play zones, and parent observation rooms designed for safety, focus, and warmth.",
          facilityImage: "/gallery_sensory_gym.jpg",
          facilityPointsJson: JSON.stringify([
            "On-site large gymnasium area for gross motor skills, movement, and play.",
            "A dedicated life skills area to practice real-world daily routines (self-care, dressing, structured tasks).",
            "Sensory integration rooms equipped with swings, foam pits, and sensory regulation tools.",
            "Quiet 1:1 learning suites designed for focused ABA and Speech-Language sessions.",
          ]),
          status: "ACTIVE",
          isDeleted: false,
        },
      });
    }

    return NextResponse.json({ success: true, about });
  } catch (error: unknown) {
    console.error("Error fetching about section:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get("admin_token")?.value;
    if (!token || !verifyAdminToken(token)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      badgeText,
      imageBadge,
      title,
      description,
      description1,
      description2,
      centerImage,
      highlights,
      highlightsJson,
      facilityHeading,
      facilityDesc,
      facilityImage,
      facilityPoints,
      facilityPointsJson,
      pillars,
      pillarsJson,
      status,
      isDeleted,
    } = body;

    let existing = await prisma.aboutSection.findFirst();

    // Preserve existing values if a specific section is being saved
    const payload: any = {};

    if (badgeText !== undefined) payload.badgeText = badgeText || null;
    if (imageBadge !== undefined) payload.imageBadge = imageBadge || null;
    if (title !== undefined) payload.title = title || "";
    if (description !== undefined) {
      payload.description1 = description || null;
      payload.description2 = null; // Clean up paragraph 2 since user requested single description
    } else if (description1 !== undefined) {
      payload.description1 = description1 || null;
      if (description2 !== undefined) payload.description2 = description2 || null;
    }

    if (centerImage !== undefined) payload.centerImage = centerImage || null;

    if (highlights !== undefined) {
      payload.highlightsJson =
        typeof highlights === "string" ? highlights : JSON.stringify(highlights || []);
    } else if (highlightsJson !== undefined) {
      payload.highlightsJson = highlightsJson;
    }

    if (facilityHeading !== undefined) payload.facilityHeading = facilityHeading || null;
    if (facilityDesc !== undefined) payload.facilityDesc = facilityDesc || null;
    if (facilityImage !== undefined) payload.facilityImage = facilityImage || null;

    if (facilityPoints !== undefined) {
      payload.facilityPointsJson =
        typeof facilityPoints === "string" ? facilityPoints : JSON.stringify(facilityPoints || []);
    } else if (facilityPointsJson !== undefined) {
      payload.facilityPointsJson = facilityPointsJson;
    }

    if (pillars !== undefined) {
      payload.pillarsJson =
        typeof pillars === "string" ? pillars : JSON.stringify(pillars || []);
    } else if (pillarsJson !== undefined) {
      payload.pillarsJson = pillarsJson;
    }

    if (status !== undefined) payload.status = status;
    if (isDeleted !== undefined) payload.isDeleted = Boolean(isDeleted);

    let updated;
    if (existing) {
      updated = await prisma.aboutSection.update({
        where: { id: existing.id },
        data: payload,
      });
    } else {
      updated = await prisma.aboutSection.create({
        data: payload,
      });
    }

    revalidatePublicPages(["/", "/about"]);

    return NextResponse.json({ success: true, about: updated });
  } catch (error: unknown) {
    console.error("Error updating about section:", error);
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

    let existing = await prisma.aboutSection.findFirst();
    if (existing) {
      await prisma.aboutSection.update({
        where: { id: existing.id },
        data: {
          status: "INACTIVE",
          isDeleted: true,
        },
      });
    }

    revalidatePublicPages(["/", "/about"]);

    return NextResponse.json({
      success: true,
      message: "About section content has been soft-deleted and deactivated.",
    });
  } catch (error: unknown) {
    console.error("Error deleting about section:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
