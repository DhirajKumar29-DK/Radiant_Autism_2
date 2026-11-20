import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminToken } from "@/modules/auth/auth.service";
import { HeroStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const pageKey = searchParams.get("pageKey");

    const where: any = {};
    if (pageKey) {
      where.pageKey = pageKey;
    }
    if (status && Object.values(HeroStatus).includes(status as HeroStatus)) {
      where.status = status as HeroStatus;
    }

    const heroes = await prisma.hero.findMany({
      where,
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ success: true, data: heroes, heroes });
  } catch (error: unknown) {
    console.error("Error fetching heroes:", error);
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
      pageKey,
      title,
      subtitle,
      badge,
      description,
      primaryButtonText,
      primaryButtonLink,
      secondaryButtonText,
      secondaryButtonLink,
      backgroundImage,
      foregroundImage,
      status,
      displayOrder,
    } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, error: "Slide Title is required" },
        { status: 400 }
      );
    }

    const newHero = await prisma.hero.create({
      data: {
        pageKey: pageKey || "home",
        title,
        subtitle: subtitle || null,
        badge: badge || null,
        description: description || null,
        primaryButtonText: primaryButtonText || null,
        primaryButtonLink: primaryButtonLink || null,
        secondaryButtonText: secondaryButtonText || null,
        secondaryButtonLink: secondaryButtonLink || null,
        backgroundImage: backgroundImage || null,
        foregroundImage: foregroundImage || null,
        status: status && Object.values(HeroStatus).includes(status as HeroStatus) ? (status as HeroStatus) : "ACTIVE",
        displayOrder: displayOrder ? parseInt(String(displayOrder), 10) : 0,
      },
    });

    return NextResponse.json({ success: true, hero: newHero, data: newHero });
  } catch (error: unknown) {
    console.error("Error creating hero:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
