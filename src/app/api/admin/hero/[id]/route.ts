import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminToken } from "@/modules/auth/auth.service";
import { HeroStatus } from "@prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const hero = await prisma.hero.findUnique({
      where: { id },
    });

    if (!hero) {
      return NextResponse.json({ success: false, error: "Hero slide not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, hero, data: hero });
  } catch (error: unknown) {
    console.error("Error fetching hero:", error);
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
    if (body.title !== undefined) dataToUpdate.title = body.title;
    if (body.subtitle !== undefined) dataToUpdate.subtitle = body.subtitle;
    if (body.badge !== undefined) dataToUpdate.badge = body.badge;
    if (body.description !== undefined) dataToUpdate.description = body.description;
    if (body.primaryButtonText !== undefined) dataToUpdate.primaryButtonText = body.primaryButtonText;
    if (body.primaryButtonLink !== undefined) dataToUpdate.primaryButtonLink = body.primaryButtonLink;
    if (body.secondaryButtonText !== undefined) dataToUpdate.secondaryButtonText = body.secondaryButtonText;
    if (body.secondaryButtonLink !== undefined) dataToUpdate.secondaryButtonLink = body.secondaryButtonLink;
    if (body.backgroundImage !== undefined) dataToUpdate.backgroundImage = body.backgroundImage;
    if (body.foregroundImage !== undefined) dataToUpdate.foregroundImage = body.foregroundImage;
    if (body.status !== undefined && Object.values(HeroStatus).includes(body.status as HeroStatus)) {
      dataToUpdate.status = body.status as HeroStatus;
    }
    if (body.displayOrder !== undefined) {
      dataToUpdate.displayOrder = parseInt(String(body.displayOrder), 10) || 0;
    }

    const updated = await prisma.hero.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, hero: updated, data: updated });
  } catch (error: unknown) {
    console.error("Error updating hero:", error);
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
    await prisma.hero.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Hero slide deleted successfully" });
  } catch (error: unknown) {
    console.error("Error deleting hero:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
