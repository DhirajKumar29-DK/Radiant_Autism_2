import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminToken } from "@/modules/auth/auth.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const blog = await prisma.blogPost.findUnique({
      where: { id },
    });

    if (!blog) {
      return NextResponse.json({ success: false, error: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, blog });
  } catch (error: unknown) {
    console.error("Error fetching blog:", error);
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
    if (body.slug !== undefined) dataToUpdate.slug = body.slug;
    if (body.excerpt !== undefined) dataToUpdate.excerpt = body.excerpt;
    if (body.content !== undefined) dataToUpdate.content = body.content;
    if (body.author !== undefined) dataToUpdate.authorName = body.author;
    if (body.authorName !== undefined) dataToUpdate.authorName = body.authorName;
    if (body.authorRole !== undefined) dataToUpdate.authorRole = body.authorRole;
    if (body.category !== undefined) dataToUpdate.category = body.category;
    if (body.image !== undefined) dataToUpdate.coverImage = body.image;
    if (body.coverImage !== undefined) dataToUpdate.coverImage = body.coverImage;
    if (body.isPublished !== undefined) {
      dataToUpdate.status = body.isPublished ? "PUBLISHED" : "DRAFT";
      if (body.isPublished && !body.publishedAt) {
        dataToUpdate.publishedAt = new Date();
      }
    }
    if (body.status !== undefined) dataToUpdate.status = body.status;

    const updated = await prisma.blogPost.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, blog: updated });
  } catch (error: unknown) {
    console.error("Error updating blog:", error);
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
    await prisma.blogPost.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Blog post deleted successfully" });
  } catch (error: unknown) {
    console.error("Error deleting blog post:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
