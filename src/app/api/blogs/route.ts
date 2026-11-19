import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const blogs = await prisma.blogPost.findMany({
      where: {
        status: "PUBLISHED",
        isDeleted: false,
      },
      orderBy: { publishedAt: "desc" },
    });

    return NextResponse.json({ success: true, blogs });
  } catch (error: unknown) {
    console.error("Error fetching public blogs:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
