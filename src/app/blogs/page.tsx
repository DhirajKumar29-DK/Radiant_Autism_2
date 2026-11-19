import React from "react";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { isPageRouteActive } from "@/lib/page-visibility";
import { BookOpen, Calendar, Clock, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Clinical Articles & Autism Guides | Radiant Autism Center",
  description:
    "Evidence-based articles on pediatric ABA therapy, speech-language milestones, occupational therapy, and Ontario Autism Program (OAP) funding guides.",
  alternates: {
    canonical: "/blogs",
  },
};

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

export default async function BlogsPage() {
  const isPageActive = await isPageRouteActive("/blogs");
  if (!isPageActive) {
    notFound();
  }

  let blogs: any[] = [];
  let hero: any = null;
  try {
    const [fetchedBlogs, fetchedHero] = await Promise.all([
      prisma.blogPost.findMany({
        where: { status: "PUBLISHED", isDeleted: false },
        orderBy: { createdAt: "desc" },
      }),
      prisma.hero.findFirst({
        where: { pageKey: "blogs", status: "ACTIVE" },
        orderBy: { displayOrder: "asc" },
      }),
    ]);
    blogs = fetchedBlogs;
    hero = fetchedHero;
  } catch (err) {
    console.error("Error fetching blogs/hero:", err);
  }

  const badge = hero?.badge || "Clinical Knowledge & Parent Guides";
  const title = hero?.title || "Autism Therapy Insights & Family Guides";
  const subtitle =
    hero?.subtitle ||
    "Written and reviewed by our Registered Behaviour Analysts (RBA) and clinical specialists to support children and families across Ontario.";
  const bgImage = hero?.backgroundImage || "/hero_child_therapy.jpg";

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
      {/* Hero Banner */}
      <section className="relative py-20 md:py-28 bg-slate-950 text-white overflow-hidden select-none">
        <div className="absolute inset-0 z-0">
          <img
            src={bgImage}
            alt={title}
            className="w-full h-full object-cover object-center opacity-30 transform animate-kenburns"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/65 to-slate-950/45" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 backdrop-blur-md text-blue-300 border border-blue-500/30 text-xs font-extrabold uppercase tracking-wider shadow-lg">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{badge}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white">
            {title}
          </h1>
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
            {subtitle}
          </p>

          {hero?.primaryButtonText && (
            <div className="pt-2">
              <Link
                href={hero.primaryButtonLink || "/blogs"}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-md transition-all"
              >
                <span>{hero.primaryButtonText}</span>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Articles Grid (Matching Image 4 Layout) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        {blogs.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-200/90 shadow-xs space-y-3">
            <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="font-bold text-slate-800 text-base">New Articles Coming Soon</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
              Our clinical team is currently preparing research articles and OAP guidance notes. Check back soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => {
              const readingTime = getReadingTime(blog.content);
              const authorInitials = getInitials(blog.authorName);

              return (
                <article
                  key={blog.id}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-blue-400 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* 16:9 Cover Image with Floating Category Pill */}
                    <Link
                      href={`/blogs/${blog.slug}`}
                      className="block relative aspect-16/9 w-full overflow-hidden bg-slate-100"
                    >
                      <img
                        src={blog.coverImage || "/hero_child_therapy.jpg"}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                      <span className="absolute top-4 left-4 bg-blue-600/95 backdrop-blur-xs text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-md">
                        {blog.category}
                      </span>
                    </Link>

                    {/* Content Section */}
                    <div className="p-6 space-y-3">
                      {/* Date & Reading Time */}
                      <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString("en-CA", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {readingTime}
                        </span>
                      </div>

                      {/* Title */}
                      <h2 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight line-clamp-2 leading-snug">
                        <Link href={`/blogs/${blog.slug}`}>{blog.title}</Link>
                      </h2>

                      {/* Excerpt */}
                      <p className="text-slate-500 text-xs font-normal line-clamp-3 leading-relaxed">
                        {blog.excerpt || blog.content.replace(/<[^>]*>/g, " ").slice(0, 140) + "..."}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer: Author + Read Article */}
                  <div className="p-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    {/* Author with Avatar circle */}
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-black text-[11px] shrink-0">
                        {authorInitials}
                      </div>
                      <span className="text-xs font-bold text-slate-700 truncate">
                        {blog.authorName}
                      </span>
                    </div>

                    {/* Read Article Link */}
                    <Link
                      href={`/blogs/${blog.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-black text-blue-600 group-hover:text-blue-700 transition-colors uppercase tracking-wider shrink-0"
                    >
                      <span>Read Article</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
