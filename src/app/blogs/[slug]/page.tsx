import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import {
  Calendar,
  User,
  ArrowLeft,
  ChevronRight,
  BookOpen,
  Share2,
  CalendarCheck,
} from "lucide-react";

interface BlogPageProps {
  params: Promise<{ slug: string }> | { slug: string } | any;
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams?.slug || "";

  try {
    const blog = await prisma.blogPost.findUnique({
      where: { slug },
    });
    if (blog) {
      return {
        title: `${blog.title} | Radiant Autism Center`,
        description: blog.excerpt || blog.title,
        alternates: { canonical: `/blogs/${blog.slug}` },
        openGraph: {
          title: `${blog.title} | Radiant Autism Center`,
          description: blog.excerpt || blog.title,
          images: [blog.coverImage || "/hero_child_therapy.jpg"],
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
  try {
    blog = await prisma.blogPost.findUnique({
      where: { slug },
    });
  } catch (err) {
    console.error("Error reading blog post:", err);
  }

  if (!blog || blog.status !== "PUBLISHED") {
    notFound();
  }

  const paragraphs = blog.content.split("\n\n").filter(Boolean);

  return (
    <main className="min-h-screen bg-slate-50 pt-24 pb-20">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200/80 py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-xs sm:text-sm text-slate-600 font-medium">
          <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap">
            <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <Link href="/blogs" className="hover:text-blue-600 transition-colors">Articles</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-bold text-slate-900 truncate max-w-xs">{blog.title}</span>
          </div>

          <Link
            href="/blogs"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Articles</span>
          </Link>
        </div>
      </div>

      {/* Article Container */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-8">
        {/* Header Block */}
        <div className="space-y-4">
          <span className="inline-block px-3.5 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-black uppercase tracking-wider">
            {blog.category}
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            {blog.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500 pt-2 border-t border-slate-200">
            <div className="flex items-center gap-1.5 text-slate-700">
              <User className="w-4 h-4 text-blue-600" />
              <span>{blog.authorName}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>
                {new Date(blog.createdAt).toLocaleDateString("en-CA", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        <div className="relative aspect-16/9 w-full rounded-3xl overflow-hidden bg-slate-900 shadow-xl border border-slate-200">
          <img
            src={blog.coverImage || "/hero_child_therapy.jpg"}
            alt={blog.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content Body */}
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200/90 shadow-xs space-y-6 text-slate-700 text-base leading-relaxed">
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
                <h2 key={idx} className="text-2xl font-black text-slate-900 pt-6">
                  {p.replace("## ", "")}
                </h2>
              );
            }
            return <p key={idx}>{p}</p>;
          })}
        </div>

        {/* Bottom CTA Box */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <h3 className="text-xl sm:text-2xl font-black tracking-tight">
              Ready to Discuss Care for Your Child?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              Schedule a free consultation with our Registered Behaviour Analyst (RBA) team to explore personalized ABA, speech, and occupational therapies.
            </p>
          </div>

          <Link
            href="/contact"
            className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-600/30 transition-all text-center shrink-0 flex items-center justify-center gap-2"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Book Free Intake</span>
          </Link>
        </div>
      </article>
    </main>
  );
}
