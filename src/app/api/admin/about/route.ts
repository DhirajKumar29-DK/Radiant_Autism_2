import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminToken } from "@/modules/auth/auth.service";

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
      title,
      description1,
      description2,
      centerImage,
      highlights,
      facilityHeading,
      facilityDesc,
      facilityImage,
    } = body;

    const payload = {
      badgeText: badgeText || null,
      title: title || "Dedicated Clinical Support for Every Child's Unique Potential",
      description1: description1 || null,
      description2: description2 || null,
      centerImage: centerImage || null,
      highlightsJson:
        typeof highlights === "string" ? highlights : JSON.stringify(highlights || []),
      facilityHeading: facilityHeading || null,
      facilityDesc: facilityDesc || null,
      facilityImage: facilityImage || null,
    };

    let existing = await prisma.aboutSection.findFirst();
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

    return NextResponse.json({ success: true, about: updated });
  } catch (error: unknown) {
    console.error("Error updating about section:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
