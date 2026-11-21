"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Award, CheckCircle2, X, ArrowUpRight, User } from "lucide-react";
import ScrollReveal from "@/common/ScrollReveal";

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  badge?: string | null;
  image?: string | null;
  bio?: string | null;
  instagram?: string | null;
  order: number;
  isActive: boolean;
}

const DEFAULT_MEMBERS: TeamMember[] = [
  {
    id: "1",
    name: "Shyni Gopal",
    role: "RBA, QBA - Clinical Director & Founder",
    badge: "Registered Behaviour Analyst (Ontario)",
    image: "/founder_portrait.jpg",
    bio: "Over 12+ years of clinical expertise specializing in person-centered ABA, VB-MAPP assessment, and compassionate family-focused therapy.",
    instagram: "https://instagram.com/radiantautism",
    order: 1,
    isActive: true,
  },
  {
    id: "2",
    name: "Dr. Marcus Vance",
    role: "Lead Speech-Language Pathologist (SLP)",
    badge: "Speech & AAC Specialist",
    image: "/hero_speech_therapy.jpg",
    bio: "Specializing in pediatric articulation, early vocalization, AAC augmentative communication devices, and oral-motor feeding coordination.",
    instagram: "https://instagram.com/radiantautism",
    order: 2,
    isActive: true,
  },
  {
    id: "3",
    name: "Elena Rostova",
    role: "Head of Occupational & Sensory Therapy",
    badge: "Sensory Integration Expert",
    image: "/hero_child_therapy.jpg",
    bio: "Expert in sensory processing gym training, fine motor dexterity, emotional self-regulation, and independent daily life skills.",
    instagram: "https://instagram.com/radiantautism",
    order: 3,
    isActive: true,
  },
  {
    id: "4",
    name: "Sarah Jenkins",
    role: "Senior Registered Behavior Technician (RBT)",
    badge: "Early Intervention Lead",
    image: "/gallery_group_play.jpg",
    bio: "Dedicated to play-infused 1:1 ABA implementation, peer socialization circles, and toddler classroom bridge readiness.",
    instagram: "https://instagram.com/radiantautism",
    order: 4,
    isActive: true,
  },
];

export default function OurTeamSection({ initialMembers }: { initialMembers?: TeamMember[] }) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() =>
    initialMembers && initialMembers.length > 0 ? initialMembers : DEFAULT_MEMBERS
  );
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchTeam = async () => {
      try {
        const res = await fetch("/api/team", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.team) && data.team.length > 0 && isMounted) {
            setTeamMembers(data.team);
          }
        }
      } catch (err) {
        console.error("Failed to fetch public team:", err);
      }
    };
    fetchTeam();
    return () => {
      isMounted = false;
    };
  }, []);

  const getInstagramUrl = (handle?: string | null) => {
    if (!handle) return "";
    const clean = handle.trim();
    if (clean.startsWith("http://") || clean.startsWith("https://")) return clean;
    return `https://instagram.com/${clean.replace(/^@/, "")}`;
  };

  return (
    <section className="py-20 md:py-28 bg-slate-900 text-white relative overflow-hidden border-t border-slate-800 select-none">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <ScrollReveal direction="up">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 backdrop-blur-md text-blue-300 border border-blue-500/30 text-xs font-black tracking-wide shadow-lg">
              <Award className="w-4 h-4 text-blue-400" />
              <span>Clinical Leadership & Staff</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-black text-white tracking-tight leading-[1.12]">
              Meet Our Dedicated Clinical Team
            </h2>

            <p className="text-slate-300 text-base sm:text-lg leading-[1.65] font-medium">
              Supervised by Registered Behaviour Analysts (RBA, Ontario) and delivered by compassionate speech, occupational, and behavior specialists.
            </p>
          </div>
        </ScrollReveal>

        {/* Team Grid: ONLY PHOTO, NAME & PROFESSION (ROLE) ON CARD */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, idx) => (
            <ScrollReveal key={member.id || idx} delay={(idx % 4) * 120} direction="up">
              <div
                onClick={() => setSelectedMember(member)}
                className="bg-slate-800/90 rounded-3xl overflow-hidden border-2 border-slate-700/80 shadow-xl hover:border-blue-400 hover:shadow-blue-500/20 hover:-translate-y-1.5 transition-all duration-300 flex flex-col group cursor-pointer"
              >
                {/* Compact Photo Box */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900">
                  <img
                    src={member.image || "/founder_portrait.jpg"}
                    alt={member.name}
                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                  {/* View Profile Indicator on Hover */}
                  <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className="w-4 h-4 text-blue-400" />
                  </div>
                </div>

                {/* Card Content: STRICTLY Name & Profession only */}
                <div className="p-5 text-center space-y-1">
                  <h3 className="text-lg font-black text-white group-hover:text-blue-300 transition-colors leading-snug">
                    {member.name}
                  </h3>
                  <p className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                    {member.role}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* CLINICIAN DETAILS POPUP MODAL (LIGHT THEME) */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-slate-200/80 animate-in zoom-in-95 duration-200 p-6 sm:p-8 space-y-6">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedMember(null)}
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Clinician Header with Photo */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 border-2 border-blue-500/30 relative shrink-0 shadow-md">
                <img
                  src={selectedMember.image || "/founder_portrait.jpg"}
                  alt={selectedMember.name}
                  className="w-full h-full object-cover object-top"
                />
              </div>

              <div className="text-center sm:text-left space-y-1.5 flex-1">
                {selectedMember.badge && (
                  <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-black tracking-wide border border-blue-200">
                    {selectedMember.badge}
                  </span>
                )}
                <h3 className="text-2xl font-black text-slate-900 leading-tight">
                  {selectedMember.name}
                </h3>
                <p className="text-xs font-bold text-blue-600 tracking-wide">
                  {selectedMember.role}
                </p>
              </div>
            </div>

            {/* Full Biography / Description */}
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                Clinical Background & Specialization
              </h4>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                {selectedMember.bio ||
                  "Supervising evidence-based developmental support and dedicated to person-centered progress."}
              </div>
            </div>

            {/* Modal Footer with Instagram Link & Close */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              {selectedMember.instagram ? (
                <a
                  href={getInstagramUrl(selectedMember.instagram)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:opacity-90 text-white text-xs font-black shadow-lg shadow-pink-600/20 transition-all cursor-pointer"
                >
                  <InstagramIcon className="w-4 h-4" />
                  <span>Instagram Profile</span>
                </a>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={() => setSelectedMember(null)}
                className="px-6 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold transition-all ml-auto cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
