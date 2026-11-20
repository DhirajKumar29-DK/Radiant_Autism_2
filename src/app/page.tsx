import React from "react";
import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import HomeSectionsContainer from "@/components/HomeSectionsContainer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Radiant Autism Center | ABA & Skill Therapy",
  description:
    "OAP covered & RBA supervised Autism Center providing ABA therapy, speech therapy, occupational therapy & early intervention in Ontario.",
  alternates: {
    canonical: "/",
  },
};

export default async function HomePage() {
  let initialAbout: any = null;
  let initialSlides: any[] = [];
  let initialNavSections: any = null;

  try {
    const [aboutRecord, heroes, navRecord] = await Promise.all([
      prisma.aboutSection.findFirst({
        where: { status: "ACTIVE", isDeleted: false },
      }),
      prisma.hero.findMany({
        where: { pageKey: "home", status: "ACTIVE" },
        orderBy: { displayOrder: "asc" },
      }),
      prisma.siteNavigation.findFirst(),
    ]);

    if (aboutRecord) {
      let highlights = [
        "100% RBA Supervised Clinical Programs",
        "Eligible for Ontario Autism Program (OAP) funding",
        "Individualized 1:1 and peer-group social rooms",
        "Family-centered progress reporting and collaboration",
      ];
      if (aboutRecord.highlightsJson) {
        try {
          const parsed = JSON.parse(aboutRecord.highlightsJson);
          if (Array.isArray(parsed) && parsed.length > 0) highlights = parsed;
        } catch (e) {
          console.error("Error parsing highlights:", e);
        }
      }

      initialAbout = {
        badgeText: aboutRecord.badgeText || "ABOUT RADIANT AUTISM & SKILL CENTER",
        title: aboutRecord.title || "Dedicated Clinical Support for Every Child's Unique Potential",
        description1: aboutRecord.description1 || "",
        description2: aboutRecord.description2 || "",
        centerImage: aboutRecord.centerImage || "/about_center_photo.jpg",
        highlights,
      };
    }

    if (heroes && heroes.length > 0) {
      initialSlides = heroes.map((h, idx) => ({
        id: h.id || idx + 1,
        badge: h.badge || "OAP COVERED & RBA SUPERVISED",
        title: h.title,
        subtitle: h.subtitle || "",
        ctaPrimary: h.primaryButtonText || "BOOK APPOINTMENT",
        ctaPrimaryLink: h.primaryButtonLink || "/contact",
        ctaSecondary: h.secondaryButtonText || "OUR SERVICES",
        ctaSecondaryLink: h.secondaryButtonLink || "/services",
        bgImage: h.backgroundImage?.trim() || "",
      }));
    }

    if (navRecord?.sectionsVisibilityJson) {
      try {
        initialNavSections = JSON.parse(navRecord.sectionsVisibilityJson);
      } catch (e) {
        console.error("Error parsing nav sections:", e);
      }
    }
  } catch (error) {
    console.error("Error fetching homepage initial server data:", error);
  }

  return (
    <HomeSectionsContainer
      initialAbout={initialAbout}
      initialSlides={initialSlides}
      initialNavSections={initialNavSections}
    />
  );
}
