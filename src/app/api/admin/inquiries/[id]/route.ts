import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminToken } from "@/modules/auth/auth.service";
import { AppointmentStatus } from "@prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get("admin_token")?.value;
    if (!token || !verifyAdminToken(token)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const inquiry = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!inquiry) {
      return NextResponse.json({ success: false, error: "Inquiry not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, inquiry });
  } catch (error: unknown) {
    console.error("Error getting inquiry:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(
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
    const { status, notes } = body;

    const dataToUpdate: any = {};
    if (status && Object.values(AppointmentStatus).includes(status as AppointmentStatus)) {
      dataToUpdate.status = status as AppointmentStatus;
    }
    if (notes !== undefined) {
      dataToUpdate.notes = notes;
    }

    const updatedInquiry = await prisma.appointment.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, inquiry: updatedInquiry });
  } catch (error: unknown) {
    console.error("Error updating inquiry:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
