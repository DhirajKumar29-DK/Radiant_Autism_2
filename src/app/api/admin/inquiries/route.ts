import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminToken } from "@/modules/auth/auth.service";
import { AppointmentStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("admin_token")?.value;
    if (!token || !verifyAdminToken(token)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    // Build where clause
    const where: any = {};

    if (status && status !== "ALL" && Object.values(AppointmentStatus).includes(status as AppointmentStatus)) {
      where.status = status as AppointmentStatus;
    }

    if (search && search.trim() !== "") {
      const q = search.trim();
      where.OR = [
        { fullName: { contains: q } },
        { email: { contains: q } },
        { phone: { contains: q } },
        { ticketId: { contains: q } },
        { service: { contains: q } },
      ];
    }

    const [inquiries, totalCount, newCount, contactedCount, confirmedCount, completedCount, cancelledCount] =
      await Promise.all([
        prisma.appointment.findMany({
          where,
          orderBy: { createdAt: "desc" },
        }),
        prisma.appointment.count(),
        prisma.appointment.count({ where: { status: "NEW" } }),
        prisma.appointment.count({ where: { status: "CONTACTED" } }),
        prisma.appointment.count({ where: { status: "CONFIRMED" } }),
        prisma.appointment.count({ where: { status: "COMPLETED" } }),
        prisma.appointment.count({ where: { status: "CANCELLED" } }),
      ]);

    return NextResponse.json({
      success: true,
      inquiries,
      counts: {
        all: totalCount,
        new: newCount,
        contacted: contactedCount,
        confirmed: confirmedCount,
        completed: completedCount,
        cancelled: cancelledCount,
      },
    });
  } catch (error: unknown) {
    console.error("Error fetching inquiries:", error);
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

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Inquiry ID is required" }, { status: 400 });
    }

    await prisma.appointment.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Inquiry deleted successfully" });
  } catch (error: unknown) {
    console.error("Error deleting inquiry:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
