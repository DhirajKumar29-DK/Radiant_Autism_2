"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, Building, ShieldCheck, HeartHandshake } from "lucide-react";
import ScrollReveal from "@/common/ScrollReveal";

interface AboutDetailData {
  badgeText: string;
  title: string;
  description1: string;
  description2?: string;
  centerImage: string;
  highlights: string[];
  facilityHeading: string;
  facilityDesc: string;
  facilityImage: string;
  facilityPoints: string[];
}

const DEFAULT_DETAIL: AboutDetailData = {
  badgeText: "ABOUT RADIANT AUTISM & SKILL CENTER",
  title: "Dedicated Clinical Support for Every Child's Unique Potential",
  description1:
    "Radiant Autism & Skill Center is a multidisciplinary pediatric clinic dedicated to delivering research-backed, compassionate developmental therapies.\n\nSupervised by our Registered Behaviour Analyst (RBA, Ontario), our team collaborates closely with families to establish individualized milestones.",
  centerImage: "/about_center_photo.jpg",
  highlights: [
    "100% RBA Supervised Clinical Programs",
    "Eligible for Ontario Autism Program (OAP) funding",
    "Individualized 1:1 and peer-group social rooms",
    "Family-centered progress reporting and collaboration",
  ],
  facilityHeading: "Our Purpose-Built Facility & Spaces",
  facilityDesc:
    "Our Radiant Autism Services centre offers purpose-built space thoughtfully designed to support learning, sensory comfort, dignity, and child safety.",
  facilityImage: "/gallery_sensory_gym.jpg",
  facilityPoints: [
    "On-site large gymnasium area for gross motor skills, movement, and play.",
    "A dedicated life skills area to practice real-world daily routines (self-care, dressing, structured tasks).",
    "Sensory integration rooms equipped with swings, foam pits, and sensory regulation tools.",
    "Quiet 1:1 learning suites designed for focused ABA and Speech-Language sessions.",
  ],
};

export default function AboutCentreDetail() {
  const [detail, setDetail] = useState<AboutDetailData>(DEFAULT_DETAIL);

  useEffect(() => {
    let isMounted = true;
    const fetchAboutData = async () => {
      try {
        const res = await fetch("/api/about", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.about && isMounted) {
            // Parse Facility Points
            let points = DEFAULT_DETAIL.facilityPoints;
            if (data.about.facilityPointsJson) {
              try {
                const parsed = JSON.parse(data.about.facilityPointsJson);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  points = parsed;
                }
              } catch (e) {
                console.error("Error parsing facility points:", e);
              }
            }

            // Parse Clinical Highlights Bullets
            let highlights = DEFAULT_DETAIL.highlights;
            if (data.about.highlightsJson) {
              try {
                const parsedH = JSON.parse(data.about.highlightsJson);
                if (Array.isArray(parsedH) && parsedH.length > 0) {
                  highlights = parsedH;
                }
              } catch (e) {
                console.error("Error parsing highlightsJson:", e);
              }
            }

            setDetail({
              badgeText: data.about.badgeText || DEFAULT_DETAIL.badgeText,
              title: data.about.title || DEFAULT_DETAIL.title,
              description1: data.about.description1 || DEFAULT_DETAIL.description1,
              description2: data.about.description2,
              centerImage: data.about.centerImage || DEFAULT_DETAIL.centerImage,
              highlights: highlights,
              facilityHeading: data.about.facilityHeading || DEFAULT_DETAIL.facilityHeading,
              facilityDesc: data.about.facilityDesc || DEFAULT_DETAIL.facilityDesc,
              facilityImage: data.about.facilityImage || DEFAULT_DETAIL.facilityImage,
              facilityPoints: points,
            });
          }
        }
      } catch (err) {
        console.error("Failed to fetch about detail:", err);
      }
    };
    fetchAboutData();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="py-20 md:py-28 bg-slate-50 relative overflow-hidden">
      {/* Soft Light Ambient Glows & Dot Grid Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute -top-32 -left-32 w-[550px] h-[550px] bg-sky-200/40 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-32 w-[550px] h-[550px] bg-indigo-100/50 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:28px_28px] opacity-40" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24 relative z-10">
        {/* Row 1: Image Left + Text Right (Overview & Mission) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6">
            <ScrollReveal direction="right">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100 group">
                <div className="aspect-4/3 w-full overflow-hidden">
                  <img
                    src={detail.centerImage || "/about_center_photo.jpg"}
                    alt="Radiant Autism Center clinicians and children in play-based learning"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                {/* Floating Badge */}
                <div className="absolute top-4 left-4 bg-slate-900/85 backdrop-blur-md border border-white/20 text-white px-3.5 py-1.5 rounded-full text-xs font-extrabold shadow-md flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  <span>OAP Covered Services</span>
                </div>
              </div>
            </ScrollReveal>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <ScrollReveal direction="left">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/90 text-blue-700 border border-blue-200/80 text-xs font-extrabold uppercase tracking-wider">
                  <Building className="w-4 h-4 text-blue-600" />
                  <span>{detail.badgeText || "ABOUT RADIANT AUTISM & SKILL CENTER"}</span>
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                  {detail.title}
                </h2>

                {/* DESCRIPTION WITH EXACT LINE BREAKS AND PARAGRAPH SPACING */}
                <div className="text-slate-600 text-base leading-relaxed font-medium whitespace-pre-line space-y-3">
                  {detail.description1}
                </div>

                {detail.description2 && (
                  <div className="text-slate-600 text-base leading-relaxed font-medium whitespace-pre-line">
                    {detail.description2}
                  </div>
                )}

                {/* DYNAMIC CLINICAL HIGHLIGHTS BULLETS (SAME AS ADMIN & HOMEPAGE) */}
                {detail.highlights && detail.highlights.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                    {detail.highlights.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs"
                      >
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <span className="text-xs font-bold text-slate-800">{item}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ScrollReveal>
          </div>
        </div>

        {/* Row 2: Text Left + Image Right (Our Purpose-Built Facility & Spaces) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6 order-2 lg:order-1">
            <ScrollReveal direction="right">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/90 text-blue-700 border border-blue-200/80 text-xs font-extrabold uppercase tracking-wider">
                  <HeartHandshake className="w-4 h-4 text-blue-600" />
                  <span>DESIGNED FOR LEARNING & COMFORT</span>
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                  {detail.facilityHeading || "Our Purpose-Built Facility & Spaces"}
                </h2>

                <div className="text-slate-600 text-base leading-relaxed font-medium whitespace-pre-line">
                  {detail.facilityDesc}
                </div>

                {/* DYNAMIC FACILITY POINTS FROM DATABASE */}
                <div className="space-y-3 pt-2">
                  {detail.facilityPoints.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                      <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                      <span className="text-slate-800 text-sm font-bold leading-normal">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>

          <div className="lg:col-span-6 order-1 lg:order-2">
            <ScrollReveal direction="left">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100 group">
                <div className="aspect-4/3 w-full overflow-hidden">
                  <img
                    src={detail.facilityImage || "/gallery_sensory_gym.jpg"}
                    alt="Sensory gym equipment and play facility"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="absolute top-4 left-4 bg-slate-900/85 backdrop-blur-md border border-white/20 text-white px-3.5 py-1.5 rounded-full text-xs font-extrabold shadow-md flex items-center gap-2">
                  <Building className="w-4 h-4 text-blue-400" />
                  <span>Sensory Gym & Play Space</span>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
