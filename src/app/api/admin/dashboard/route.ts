import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminToken } from "@/modules/auth/auth.service";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("admin_token")?.value;
    if (!token || !verifyAdminToken(token)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const [
      totalAppointments,
      newAppointments,
      totalServices,
      totalTeam,
      recentAppointments,
    ] = await Promise.all([
      prisma.appointment.count(),
      prisma.appointment.count({ where: { status: "NEW" } }),
      prisma.service.count({ where: { isActive: true } }),
      prisma.teamMember.count({ where: { isActive: true } }),
      prisma.appointment.findMany({
        take: 5,
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalAppointments,
        newAppointments,
        totalServices,
        totalTeam,
      },
      recentAppointments,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching dashboard stats";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
