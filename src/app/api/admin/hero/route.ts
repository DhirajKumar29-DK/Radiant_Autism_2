import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminToken } from "@/modules/auth/auth.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageKey = searchParams.get("pageKey");

    if (pageKey) {
      const hero = await prisma.pageHero.findUnique({
        where: { pageKey },
      });
      return NextResponse.json({ success: true, hero });
    }

    const heroes = await prisma.pageHero.findMany();
    return NextResponse.json({ success: true, heroes });
  } catch (error: unknown) {
    console.error("Error fetching hero:", error);
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
      pageKey,
      badgeText,
      title,
      subtitle,
      bgImage,
      slidesJson,
      primaryBtnText,
      primaryBtnLink,
      secondaryBtnText,
      secondaryBtnLink,
    } = body;

    if (!pageKey || !title) {
      return NextResponse.json(
        { success: false, error: "pageKey and title are required" },
        { status: 400 }
      );
    }

    const payload: any = {
      badgeText: badgeText || null,
      title,
      subtitle: subtitle || null,
      bgImage: bgImage || null,
      slidesJson:
        typeof slidesJson === "string" ? slidesJson : JSON.stringify(slidesJson || []),
      primaryBtnText: primaryBtnText || null,
      primaryBtnLink: primaryBtnLink || null,
      secondaryBtnText: secondaryBtnText || null,
      secondaryBtnLink: secondaryBtnLink || null,
    };

    const updatedHero = await prisma.pageHero.upsert({
      where: { pageKey },
      update: payload,
      create: { pageKey, ...payload },
    });

    return NextResponse.json({ success: true, hero: updatedHero });
  } catch (error: unknown) {
    console.error("Error updating hero:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
