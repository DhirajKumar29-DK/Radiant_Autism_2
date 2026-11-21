import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { isPageRouteActive, getPageSections } from "@/lib/page-visibility";
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
  const [isPageActive, sections, hero] = await Promise.all([
    isPageRouteActive("/services"),
    getPageSections("services"),
    prisma.hero
      .findFirst({
        where: { pageKey: "services", status: "ACTIVE" },
        orderBy: { displayOrder: "asc" },
      })
      .catch(() => null),
  ]);

  if (!isPageActive) {
    notFound();
  }

  const bgImage = hero?.backgroundImage?.trim() || null;

  return (
    <div className="space-y-0 pb-16">
      {/* 1. Premium Photo Hero Banner (Rendered only if configured in Admin) */}
      {sections.hero !== false && hero && (
        <section className="relative py-20 md:py-28 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white overflow-hidden select-none">
          {/* Background Image with Zoom & Dark Gradient Overlay (Shown only if configured by Admin) */}
          {bgImage && (
            <div className="absolute inset-0 z-0">
              <img
                src={bgImage}
                alt={hero.title}
                className="w-full h-full object-cover object-center transform animate-kenburns"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/75 via-slate-950/50 to-slate-950/30" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-slate-950/20" />
            </div>
          )}

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-4">
            {hero.badge && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 backdrop-blur-md text-blue-300 border border-blue-500/30 text-xs font-black tracking-wide shadow-lg">
                <span>{hero.badge}</span>
              </div>
            )}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-[68px] font-black tracking-tight leading-[1.08] text-white">
              {hero.title}
            </h1>
            {hero.subtitle && (
              <p className="text-slate-200 text-base sm:text-lg lg:text-xl max-w-2xl mx-auto font-medium leading-[1.65]">
                {hero.subtitle}
              </p>
            )}

            {hero.primaryButtonText && (
              <div className="pt-2">
                <Link
                  href={hero.primaryButtonLink || "/contact"}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs tracking-wider shadow-md transition-all"
                >
                  <span>{hero.primaryButtonText}</span>
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 2. Services Grid (All Services) */}
      {sections.servicesGrid !== false && <ServicesGrid />}

      {/* 3. Bottom Consultation & Assessment CTA Banner */}
      {sections.ctaBanner !== false && (
        <section className="mt-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-blue-800/40">
            <div className="space-y-2 text-center md:text-left">
              <span className="text-xs font-black uppercase tracking-wider text-sky-400 bg-blue-950/80 px-3 py-1 rounded-full border border-sky-400/20">
                Personalized Care Assessment
              </span>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
                Not sure which clinical therapy fits your child?
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm font-medium max-w-xl">
                Our registered clinical team will conduct a comprehensive initial intake and create a milestone roadmap.
              </p>
            </div>
            <Link
              href="/contact"
              className="px-8 py-3.5 rounded-2xl bg-blue-500 hover:bg-blue-400 text-white font-black text-xs uppercase tracking-wider shadow-lg transition-all shrink-0 cursor-pointer"
            >
              Book An Intake Consultation
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
