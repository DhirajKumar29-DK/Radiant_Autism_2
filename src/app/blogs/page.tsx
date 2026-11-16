import React from "react";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { BookOpen, Calendar, User, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Clinical Articles & Autism Guides | Radiant Autism Center",
  description:
    "Evidence-based articles on pediatric ABA therapy, speech-language milestones, occupational therapy, and Ontario Autism Program (OAP) funding guides.",
  alternates: {
    canonical: "/blogs",
  },
};

export default async function BlogsPage() {
  let blogs: any[] = [];
  let hero: any = null;
  try {
    const [fetchedBlogs, fetchedHero] = await Promise.all([
      prisma.blogPost.findMany({
        where: { status: "PUBLISHED" },
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
    "Written and reviewed by our Registered Behaviour Analysts (RBA) and clinical specialists to support children and families.";
  const bgImage = hero?.backgroundImage || "/hero_child_therapy.jpg";

  return (
    <div className="space-y-0 pb-20">
      {/* Hero Banner */}
      <section className="relative py-20 md:py-28 bg-slate-950 text-white overflow-hidden select-none">
        <div className="absolute inset-0 z-0">
          <img
            src={bgImage}
            alt={title}
            className="w-full h-full object-cover object-center opacity-30 transform animate-kenburns"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/60 to-slate-950/40" />
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

      {/* Articles Grid */}
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
            {blogs.map((blog) => (
              <article
                key={blog.id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-blue-400 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <Link href={`/blogs/${blog.slug}`} className="block relative aspect-16/10 w-full overflow-hidden bg-slate-100">
                    <img
                      src={blog.coverImage || "/hero_child_therapy.jpg"}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                    <span className="absolute top-4 left-4 bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                      {blog.category}
                    </span>
                  </Link>

                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-3 text-slate-500 text-[11px] font-bold">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-blue-600" />
                        {blog.authorName}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(blog.createdAt).toLocaleDateString("en-CA", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <h2 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2">
                      <Link href={`/blogs/${blog.slug}`}>{blog.title}</Link>
                    </h2>

                    <p className="text-slate-600 text-xs font-medium line-clamp-3 leading-relaxed">
                      {blog.excerpt || blog.content.slice(0, 140) + "..."}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-slate-100 mt-4 flex items-center justify-between">
                  <Link
                    href={`/blogs/${blog.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-black text-blue-600 group-hover:text-blue-700 transition-colors uppercase tracking-wider"
                  >
                    <span>Read Article</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
