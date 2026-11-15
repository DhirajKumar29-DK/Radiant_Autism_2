"use client";

import React from "react";
import Link from "next/link";
import {
  Brain,
  MessageCircle,
  Activity,
  Compass,
  Calendar,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import ScrollReveal from "@/common/ScrollReveal";
import SectionHeading from "@/common/SectionHeading";

export default function ServicesGrid({ limit }: { limit?: number }) {
  const services = [
    {
      id: "aba-therapy",
      title: "ABA Therapy (Applied Behavior Analysis)",
      badge: "OAP Covered",
      badgeBg: "bg-blue-600",
      iconBg: "bg-blue-600",
      bulletColor: "text-blue-600",
      icon: Brain,
      image: "/hero_child_therapy.jpg",
      imgAlt: "ABA Therapy session",
      description:
        "Evidence-based Applied Behaviour Analysis (ABA) targeting functional communication, positive behavior reinforcement, play skills, self-help, and individualized developmental milestones for ages 2 to 20.",
      features: [
        "RBA Supervised Clinical Care",
        "Ages 2 to 20 Years",
        "Target Verbal & Daily Life Skills",
      ],
    },
    {
      id: "speech-therapy",
      title: "Speech and Language Service (SLP)",
      badge: "Communication Care",
      badgeBg: "bg-teal-600",
      iconBg: "bg-teal-600",
      bulletColor: "text-teal-600",
      icon: MessageCircle,
      image: "/hero_speech_therapy.jpg",
      imgAlt: "Speech and language therapy session",
      description:
        "Comprehensive Speech-Language Pathology (SLP) assessments and individualized therapy targeting verbal articulation, early vocalizations, receptive language, and alternative communication (AAC).",
      features: [
        "Registered SLP Clinical Lead",
        "Language & Articulation Skills",
        "Combined SLP + ABA Methods",
      ],
    },
    {
      id: "occupational-therapy",
      title: "Occupational Therapy (OT)",
      badge: "Motor & Sensory",
      badgeBg: "bg-indigo-600",
      iconBg: "bg-indigo-600",
      bulletColor: "text-indigo-600",
      icon: Activity,
      image: "/gallery_sensory_gym.jpg",
      imgAlt: "Sensory gym occupational therapy",
      description:
        "Targeted occupational therapy directly addressing fine and gross motor development, sensory regulation, core coordination, handwriting, and essential daily living independence.",
      features: [
        "Fine & Gross Motor Skills",
        "Sensory Processing & Regulation",
        "Daily Living Independence",
      ],
    },
    {
      id: "life-skills",
      title: "Life Skills & Group Programs",
      badge: "Ages 9–18 & Groups",
      badgeBg: "bg-purple-600",
      iconBg: "bg-purple-600",
      bulletColor: "text-purple-600",
      icon: Compass,
      image: "/gallery_group_play.jpg",
      imgAlt: "Life skills and social peer group session",
      description:
        "Integrated peer social groups and practical life skills training for ages 9–18, plus pre-employment readiness to build lasting friendship, independence, and career exploration.",
      features: [
        "Ages 9–18 Dedicated Focus",
        "Structured Peer Social Groups",
        "Pre-Employment Skills (Prerequisite Needed)",
      ],
    },
  ];

  const displayedServices = limit ? services.slice(0, limit) : services;

  return (
    <section className="py-16 md:py-24 bg-slate-50/70 relative overflow-hidden">
      {/* Soft Light Ambient Glows & Dot Grid Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute -top-32 -right-32 w-[550px] h-[550px] bg-sky-200/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-[550px] h-[550px] bg-indigo-100/50 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:28px_28px] opacity-40" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <ScrollReveal direction="up">
          <SectionHeading
            badgeText="OUR CORE PROGRAMS"
            title="Evidence-Based Clinical Services"
            subtitle="Explore our 4 core clinical offerings designed to empower communication, motor independence, and social confidence."
            align="center"
          />
        </ScrollReveal>

        {/* 2:2 Ratio Grid (2 Cards Per Row) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 pt-10 items-stretch max-w-5xl mx-auto">
          {displayedServices.map((svc, idx) => {
            const Icon = svc.icon;
            // On homepage, clicking the card directs to /services. On /services, it directs to /services/[id]
            const cardUrl = limit ? "/services" : `/services/${svc.id}`;
            const detailUrl = `/services/${svc.id}`;

            return (
              <ScrollReveal key={svc.id} delay={(idx % 2) * 120} direction="up">
                <div className="bg-white rounded-3xl overflow-hidden border-2 border-slate-200/90 shadow-md hover:shadow-2xl hover:shadow-blue-600/10 hover:border-blue-600 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between h-full group">
                  <div>
                    {/* Clickable Image Frame */}
                    <Link href={cardUrl} className="block relative aspect-16/10 w-full overflow-hidden bg-slate-100 group/img">
                      <img
                        src={svc.image}
                        alt={svc.imgAlt}
                        className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />

                      {/* Category Badge */}
                      <span
                        className={`absolute top-4 left-4 text-white text-[11px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-md ${svc.badgeBg}`}
                      >
                        {svc.badge}
                      </span>
                    </Link>

                    {/* Content Section */}
                    <div className="p-6 sm:p-7 space-y-4">
                      {/* Icon + Title */}
                      <div className="flex items-start gap-3.5">
                        <Link href={cardUrl} className="shrink-0">
                          <div
                            className={`w-11 h-11 rounded-2xl ${svc.iconBg} text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300`}
                          >
                            <Icon className="w-5.5 h-5.5 stroke-[2.5]" />
                          </div>
                        </Link>
                        <Link href={cardUrl} className="group-hover:text-blue-600 transition-colors">
                          <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-tight pt-0.5">
                            {svc.title}
                          </h3>
                        </Link>
                      </div>

                      {/* Short Description */}
                      <p className="text-slate-600 text-sm leading-relaxed font-medium">
                        {svc.description}
                      </p>

                      {/* Feature Bullet Points */}
                      <ul className="space-y-2 pt-2 border-t border-slate-100">
                        {svc.features.map((feat, fIdx) => (
                          <li key={fIdx} className="flex items-center gap-2.5 text-xs font-bold text-slate-700">
                            <CheckCircle2 className={`w-4 h-4 shrink-0 ${svc.bulletColor}`} />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Actions: On Homepage -> 1 button to /services. On /services page -> 2 buttons: Book Appointment & View Program Details */}
                  <div className="px-6 pb-6 sm:px-7 sm:pb-7 pt-3">
                    {limit ? (
                      /* Homepage Card Button -> Redirects to /services */
                      <Link
                        href="/services"
                        className="w-full py-3.5 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30 transform hover:-translate-y-0.5 text-center group/btn"
                      >
                        <span>Explore In Services</span>
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    ) : (
                      /* Services Page Card Buttons: 1 for Appointment, 1 for Opening Program Page */
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Link
                          href={`/contact?service=${encodeURIComponent(svc.title)}`}
                          className="py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30 transform hover:-translate-y-0.5 text-center"
                        >
                          <Calendar className="w-4 h-4 shrink-0" />
                          <span>Book Appointment</span>
                        </Link>

                        <Link
                          href={detailUrl}
                          className="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-blue-50 text-slate-800 hover:text-blue-700 border border-slate-200 hover:border-blue-300 font-extrabold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 text-center group/btn"
                        >
                          <span>View Details</span>
                          <ArrowRight className="w-3.5 h-3.5 shrink-0 group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* View All / Explore Services Button on Homepage */}
        {limit && (
          <div className="text-center pt-12">
            <Link
              href="/services"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg hover:shadow-xl transition-all group"
            >
              <span>Explore All Clinical Services</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-sky-400" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
