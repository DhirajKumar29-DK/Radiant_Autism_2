import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminToken } from "@/modules/auth/auth.service";

export async function GET() {
  try {
    const blogs = await prisma.blogPost.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, blogs });
  } catch (error: unknown) {
    console.error("Error fetching blogs:", error);
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
    const { title, slug, excerpt, content, author, authorRole, category, image, isPublished } = body;

    if (!title || !slug || !content) {
      return NextResponse.json(
        { success: false, error: "Title, slug, and content are required" },
        { status: 400 }
      );
    }

    const cleanSlug = slug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-");

    const existing = await prisma.blogPost.findUnique({
      where: { slug: cleanSlug },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: `An article with slug "${cleanSlug}" already exists.` },
        { status: 409 }
      );
    }

    const newPost = await prisma.blogPost.create({
      data: {
        title,
        slug: cleanSlug,
        excerpt: excerpt || null,
        content,
        authorName: author || "Radiant Clinical Team",
        authorRole: authorRole || "Registered Clinical Team",
        category: category || "Autism Care",
        coverImage: image || "/hero_child_therapy.jpg",
        status: isPublished ? "PUBLISHED" : "DRAFT",
        publishedAt: isPublished ? new Date() : null,
      },
    });

    return NextResponse.json({ success: true, blog: newPost });
  } catch (error: unknown) {
    console.error("Error creating blog:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
