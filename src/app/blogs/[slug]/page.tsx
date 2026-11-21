import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import {
  Calendar,
  Clock,
  ArrowLeft,
  Sparkles,
  CalendarCheck,
  ArrowRight,
} from "lucide-react";

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const blogs = await prisma.blogPost.findMany({
      where: { status: "PUBLISHED", isDeleted: false },
      select: { slug: true },
    });
    return blogs.map((b) => ({ slug: b.slug }));
  } catch {
    return [];
  }
}

interface BlogPageProps {
  params: Promise<{ slug: string }> | { slug: string } | any;
}

function getReadingTime(content: string = ""): string {
  const clean = content.replace(/<[^>]*>/g, " ").trim();
  const words = clean.split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.ceil(words / 200));
  return `${mins} min read`;
}

function getInitials(name: string = "Radiant"): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return (name[0] || "R").toUpperCase();
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams?.slug || "";

  try {
    const blog = await prisma.blogPost.findUnique({
      where: { slug },
    });
    if (blog) {
      const pageTitle = blog.metaTitle || `${blog.title} | Radiant Autism Center`;
      const pageDesc = blog.metaDescription || blog.excerpt || blog.title;
      const ogImg = blog.ogImage || blog.coverImage || "/hero_child_therapy.jpg";
      return {
        title: pageTitle,
        description: pageDesc,
        keywords: blog.metaKeywords ? blog.metaKeywords.split(",").map((k) => k.trim()) : undefined,
        alternates: { canonical: `/blogs/${blog.slug}` },
        openGraph: {
          title: pageTitle,
          description: pageDesc,
          images: [ogImg],
        },
      };
    }
  } catch (err) {
    console.error("Metadata error:", err);
  }

  return { title: "Article Not Found | Radiant Autism Center" };
}

export default async function SingleBlogPage({ params }: BlogPageProps) {
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams?.slug || "";

  let blog = null;
  let recentBlogs: any[] = [];

  try {
    const [fetchedBlog, fetchedRecents] = await Promise.all([
      prisma.blogPost.findUnique({
        where: { slug },
      }),
      // Fixed to 3 latest published blogs
      prisma.blogPost.findMany({
        where: {
          status: "PUBLISHED",
          isDeleted: false,
          slug: { not: slug },
        },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
    ]);
    blog = fetchedBlog;
    recentBlogs = fetchedRecents;
  } catch (err) {
    console.error("Error reading blog post:", err);
  }

  if (!blog || blog.status !== "PUBLISHED" || blog.isDeleted) {
    notFound();
  }

  const readingTime = getReadingTime(blog.content);
  const authorInitials = getInitials(blog.authorName);
  const hasHtml = /<\/?[a-z][\s\S]*>/i.test(blog.content);
  const paragraphs = blog.content.split("\n\n").filter(Boolean);

  return (
    <main className="min-h-screen bg-white pt-5 sm:pt-7 pb-20">
      {/* 1. Main Container: Exactly 1400px Max Width with px-4 md:px-8 */}
      <div className="container mx-auto px-4 md:px-8 max-w-[1400px]">
        {/* 2. Grid Layout: 12 Columns (8 Cols Left / 4 Cols Right) with gap-10 lg:gap-12 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* LEFT COLUMN: Main Blog Content (66.67% width) */}
          <article className="lg:col-span-8 space-y-6 min-w-0">
            {/* Top Navigation: Back to All Articles */}
            <div>
              <Link
                href="/blogs"
                className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500 hover:text-blue-600 transition-colors group cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                <span>Back to All Articles</span>
              </Link>
            </div>

            {/* Badges Row: Category + Read Time */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-black uppercase tracking-wider border border-blue-200/80 shadow-2xs">
                {blog.category}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200/80">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{readingTime}</span>
              </span>
            </div>

            {/* Article Main Headline */}
            <h1 className="text-2xl sm:text-4xl lg:text-[44px] font-black text-slate-900 tracking-tight leading-[1.2] uppercase">
              {blog.title}
            </h1>

            {/* Author & Published Date Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-3.5 border-y border-slate-200 text-xs text-slate-500">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-md shrink-0">
                  {authorInitials}
                </div>
                <div>
                  <p className="font-extrabold text-slate-900 text-sm leading-tight">
                    {blog.authorName}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium pt-0.5">
                    {blog.authorRole || "Registered Clinical Team"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>
                  {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString("en-CA", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* Large Featured Cover Image */}
            <div className="relative aspect-16/9 w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/90 shadow-sm">
              <img
                src={blog.coverImage || "/hero_child_therapy.jpg"}
                alt={blog.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Short Description Quote: Clean White UI with Left Blue Accent Line */}
            {blog.excerpt && (
              <div className="my-7 bg-white border-l-4 sm:border-l-[5px] border-blue-600 py-3.5 px-6 sm:px-7 rounded-r-xl shadow-2xs">
                <p className="text-base sm:text-lg text-slate-800 font-medium italic leading-relaxed sm:leading-8">
                  &ldquo;{blog.excerpt}&rdquo;
                </p>
              </div>
            )}

            {/* Body Content (Direct Natural Typography, No Disconnected Card Border) */}
            <div className="blog-article-content text-slate-700 leading-relaxed font-normal text-base sm:text-[17px] space-y-6 pt-1">
              {hasHtml ? (
                <div dangerouslySetInnerHTML={{ __html: blog.content }} />
              ) : (
                <div className="space-y-5">
                  {paragraphs.map((p: string, idx: number) => {
                    if (p.startsWith("### ")) {
                      return (
                        <h3 key={idx} className="text-xl font-black text-slate-900 pt-4">
                          {p.replace("### ", "")}
                        </h3>
                      );
                    }
                    if (p.startsWith("## ")) {
                      return (
                        <h2 key={idx} className="text-2xl sm:text-3xl font-black text-slate-900 pt-6">
                          {p.replace("## ", "")}
                        </h2>
                      );
                    }
                    return <p key={idx}>{p}</p>;
                  })}
                </div>
              )}
            </div>
          </article>

          {/* 3. RIGHT COLUMN: Sticky Sidebar (33.33% width, lg:top-24, self-start) */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24 self-start space-y-4">
            {/* Widget 1: Recent Posts (Fixed to Exactly 3 latest published, rounded-2xl, p-4 md:p-5) */}
            <div className="bg-slate-50/80 rounded-2xl p-4 md:p-5 border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/70">
                <h3 className="font-black text-xs uppercase tracking-wider text-slate-900">
                  Recent Posts
                </h3>
                <Sparkles className="w-4 h-4 text-blue-600" />
              </div>

              {recentBlogs.length === 0 ? (
                <p className="text-xs text-slate-400 font-medium text-center py-4">
                  No other articles published yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {recentBlogs.map((item) => (
                    <Link
                      key={item.id}
                      href={`/blogs/${item.slug}`}
                      className="flex items-center gap-3 group p-2 rounded-xl hover:bg-white hover:shadow-xs border border-transparent hover:border-slate-200/80 transition-all"
                    >
                      {/* Thumbnail: w-14 h-14 (56px x 56px) rounded-lg */}
                      <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-slate-200 shrink-0 border border-slate-200">
                        <img
                          src={item.coverImage || "/hero_child_therapy.jpg"}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <span className="inline-block text-[10px] font-black text-blue-600 uppercase tracking-wider">
                          {item.category}
                        </span>
                        <h4 className="text-xs font-bold text-slate-800 group-hover:text-blue-600 line-clamp-2 leading-snug transition-colors">
                          {item.title}
                        </h4>
                        <p className="text-[10px] font-semibold text-slate-400 flex items-center gap-1 pt-0.5">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {new Date(item.publishedAt || item.createdAt).toLocaleDateString("en-CA", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Widget 2: CTA Card (Matching FabFit 'TRANSFORM YOUR PHYSIQUE' in Radiant Blue) */}
            <div className="bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 border border-blue-900/60 rounded-2xl p-4 md:p-5 text-center shadow-2xl relative overflow-hidden group">
              {/* Top-right blue ambient glow */}
              <div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/10 blur-2xl rounded-full pointer-events-none" />

              <CalendarCheck className="w-7 h-7 text-blue-400 mx-auto mb-2 stroke-[2.5]" />

              <h4 className="text-sm md:text-base font-black uppercase tracking-tight text-white mb-1">
                Transform Your <span className="text-blue-400">Child&apos;s Journey</span>
              </h4>

              <p className="text-slate-300 text-xs font-medium mb-3.5 leading-relaxed">
                Get 100% customized clinical therapy roadmaps supervised by Registered Behaviour Analysts (RBA). OAP covered.
              </p>

              <Link
                href="/contact"
                className="inline-flex items-center justify-center w-full py-2.5 bg-blue-600 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl hover:bg-blue-500 transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.4)]"
              >
                <span>BOOK FREE ASSESSMENT</span>
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
