import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import prisma from "@/lib/prisma";
import AboutCentreDetail from "@/components/AboutCentreDetail";
import OurTeamSection from "@/components/OurTeamSection";
import ClinicalPillars from "@/components/ClinicalPillars";
import { ArrowRight } from "lucide-react";

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
  let hero: any = null;
  try {
    hero = await prisma.hero.findFirst({
      where: { pageKey: "about", status: "ACTIVE" },
      orderBy: { displayOrder: "asc" },
    });
  } catch (e) {
    // Fallback to default content
  }

  const badge = hero?.badge || "About Radiant Autism Center";
  const title = hero?.title || "Dedicated To Empowering Exceptional Children";
  const subtitle =
    hero?.subtitle ||
    "Learn about our clinical standards, registered RBA clinical leadership, and compassionate approach to child skill development.";
  const bgImage = hero?.backgroundImage || "/about_center_photo.jpg";

  return (
    <div className="space-y-0 pb-16">
      {/* Premium Photo Hero Banner */}
      <section className="relative py-20 md:py-28 bg-slate-950 text-white overflow-hidden select-none">
        {/* Background Image with Dark Gradient Overlay */}
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

      {/* About Centre & Purpose Built Spaces */}
      <AboutCentreDetail />

      {/* Clinical Leadership & Our Team */}
      <OurTeamSection />

      {/* Luxury 4 Clinical Pillars Section */}
      <ClinicalPillars />

      {/* Schedule Visit CTA */}
      <div className="text-center pt-8">
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 px-9 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-xl shadow-blue-600/25 transition-all group"
        >
          <span>Schedule A Visit To Our Center</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
