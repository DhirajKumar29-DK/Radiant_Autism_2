import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { isPageRouteActive } from "@/lib/page-visibility";
import ServicesGrid from "@/components/ServicesGrid";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Clinical Services | Radiant Autism Center",
  description:
    "Explore our 4 core clinical programs: ABA therapy, speech and language service, occupational therapy, and life skills & group programs.",
  alternates: {
    canonical: "/services",
  },
  openGraph: {
    title: "Clinical Services | Radiant Autism Center",
    description:
      "Explore our 4 core clinical programs: ABA therapy, speech and language service, occupational therapy, and life skills & group programs.",
    images: ["/hero_child_therapy.jpg"],
  },
};

export default async function ServicesPage() {
  const isPageActive = await isPageRouteActive("/services");
  if (!isPageActive) {
    notFound();
  }

  let hero: any = null;
  try {
    hero = await prisma.hero.findFirst({
      where: { pageKey: "services", status: "ACTIVE" },
      orderBy: { displayOrder: "asc" },
    });
  } catch (e) {
    // Fallback
  }

  const badge = hero?.badge || "Radiant Clinical Services";
  const title = hero?.title || "Evidence-Based Therapy & Skill Development";
  const subtitle =
    hero?.subtitle ||
    "Explore our comprehensive range of 1:1 individualized therapy and group services supervised by registered RBA clinicians.";
  const bgImage = hero?.backgroundImage || "/hero_child_therapy.jpg";

  return (
    <div className="space-y-0 pb-16">
      {/* Premium Photo Hero Banner */}
      <section className="relative py-20 md:py-28 bg-slate-950 text-white overflow-hidden select-none">
        {/* Background Image with Zoom & Dark Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={bgImage}
            alt={title}
            className="w-full h-full object-cover object-center transform animate-kenburns"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/75 via-slate-950/50 to-slate-950/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-slate-950/20" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 backdrop-blur-md text-blue-300 border border-blue-500/30 text-xs font-extrabold uppercase tracking-wider shadow-lg">
            <span>{badge}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white">
            {title}
          </h1>
          <p className="text-slate-200 text-base sm:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
            {subtitle}
          </p>

          {hero?.primaryButtonText && (
            <div className="pt-2">
              <Link
                href={hero.primaryButtonLink || "/contact"}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-md transition-all"
              >
                <span>{hero.primaryButtonText}</span>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Services Grid (All Services) */}
      <ServicesGrid />
    </div>
  );
}
