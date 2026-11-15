"use client";

import React, { useState, useEffect } from "react";
import Hero from "@/components/Hero";
import AboutSection from "@/components/AboutSection";
import CareApproachSection from "@/components/CareApproachSection";
import OurApproachProcess from "@/components/OurApproachProcess";
import ServicesGrid from "@/components/ServicesGrid";
import HomeGalleryPreview from "@/components/HomeGalleryPreview";

export default function HomeSectionsContainer() {
  const [sections, setSections] = useState({
    hero: true,
    about: true,
    careApproach: true,
    services: true,
    process: true,
    gallery: true,
  });

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const res = await fetch("/api/admin/navigation");
        if (res.ok) {
          const data = await res.json();
          if (data.sectionsVisibility) {
            setSections(data.sectionsVisibility);
          }
        }
      } catch (err) {
        // Fallback to all true
      }
    };
    fetchSections();
  }, []);

  return (
    <div className="space-y-0">
      {sections.hero && <Hero />}
      {sections.about && <AboutSection />}
      {sections.careApproach && <CareApproachSection />}
      {sections.services && <ServicesGrid limit={4} />}
      {sections.process && <OurApproachProcess />}
      {sections.gallery && <HomeGalleryPreview />}
    </div>
  );
}
