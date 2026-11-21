import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { isPageRouteActive, getPageSections } from "@/lib/page-visibility";
import AboutCentreDetail from "@/components/AboutCentreDetail";
import OurTeamSection from "@/components/OurTeamSection";
import ClinicalPillars from "@/components/ClinicalPillars";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About Us | Radiant Autism Center",
  description:
    "Learn about Radiant Autism Center, our registered RBA clinical leadership, clinical standards, and compassionate child skill development in Ontario.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Us | Radiant Autism Center",
    description:
      "Learn about Radiant Autism Center, our registered RBA clinical leadership, clinical standards, and compassionate child skill development in Ontario.",
    images: ["/about_center_photo.jpg"],
  },
};

export default async function AboutPage() {
  const [isPageActive, sections, hero] = await Promise.all([
    isPageRouteActive("/about"),
    getPageSections("about"),
    prisma.hero
      .findFirst({
        where: { pageKey: "about", status: "ACTIVE" },
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
          {/* Background Image with Dark Gradient Overlay (Shown only if configured by Admin) */}
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
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 backdrop-blur-md text-blue-300 border border-blue-500/30 text-xs font-extrabold uppercase tracking-wider shadow-lg">
                <span>{hero.badge}</span>
              </div>
            )}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white">
              {hero.title}
            </h1>
            {hero.subtitle && (
              <p className="text-slate-200 text-base sm:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
                {hero.subtitle}
              </p>
            )}

            {hero.primaryButtonText && (
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
      )}

      {/* 2. About Centre & Purpose Built Spaces */}
      {sections.facility !== false && <AboutCentreDetail />}

      {/* 3. Clinical Leadership & Our Team */}
      {sections.team !== false && <OurTeamSection />}

      {/* 4. Luxury 4 Clinical Pillars Section */}
      {sections.pillars !== false && <ClinicalPillars />}

      {/* 5. Schedule Visit CTA Banner */}
      {sections.ctaBanner !== false && (
        <div className="text-center pt-8">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-9 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-xl shadow-blue-600/25 transition-all group"
          >
            <span>Schedule A Visit To Our Center</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      )}
    </div>
  );
}
