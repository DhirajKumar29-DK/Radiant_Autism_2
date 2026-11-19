import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    let about = await prisma.aboutSection.findFirst();

    if (!about) {
      about = await prisma.aboutSection.create({
        data: {
          badgeText: "ABOUT RADIANT AUTISM & SKILL CENTER",
          title: "Dedicated Clinical Support for Every Child's Unique Potential",
          description1:
            "Radiant Autism & Skill Center is a multidisciplinary pediatric clinic dedicated to delivering research-backed, compassionate developmental therapies.",
          centerImage: "/about_center_photo.jpg",
          highlightsJson: JSON.stringify([
            "100% RBA Supervised Clinical Programs",
            "Eligible for Ontario Autism Program (OAP) funding",
            "Individualized 1:1 and peer-group social rooms",
            "Family-centered progress reporting and collaboration",
          ]),
          facilityHeading: "Modern Sensory-Rich Clinical Environment",
          facilityDesc:
            "Our clinic features custom sensory gyms, private 1:1 intervention suites, gross-motor play zones, and parent observation rooms designed for safety, focus, and warmth.",
          facilityImage: "/gallery_sensory_gym.jpg",
          facilityPointsJson: JSON.stringify([
            "On-site large gymnasium area for gross motor skills, movement, and play.",
            "A dedicated life skills area to practice real-world daily routines (self-care, dressing, structured tasks).",
            "Sensory integration rooms equipped with swings, foam pits, and sensory regulation tools.",
            "Quiet 1:1 learning suites designed for focused ABA and Speech-Language sessions.",
          ]),
          pillarsJson: JSON.stringify([
            {
              id: "01",
              title: "Person-Centered ABA",
              badge: "Empowerment",
              desc: "Every intervention honors the child's individual personality, dignity, strengths, and natural communication pace.",
              icon: "HeartHandshake",
              points: ["Dignity-first approach", "Positive Reinforcement"],
            },
            {
              id: "02",
              title: "1:1 RBA Supervision",
              badge: "RBA Led",
              desc: "Registered Behaviour Analysts (Ontario) directly design, continuously monitor, and adjust clinical progress for every child.",
              icon: "Award",
              points: ["Certified Clinicians", "VB-MAPP & ABLLS-R"],
            },
            {
              id: "03",
              title: "Multidisciplinary Integration",
              badge: "360° Care",
              desc: "Seamlessly combining speech-language pathology, occupational sensory care, and pediatric physio for holistic development.",
              icon: "Users",
              points: ["Speech + OT + ABA", "Unified Goal Roadmap"],
            },
            {
              id: "04",
              title: "OAP Covered & CEU Programs",
              badge: "Accredited",
              desc: "Clinical center offering OAP eligible family support funding programs and professional clinical development.",
              icon: "ShieldCheck",
              points: ["OAP Covered Services", "Parent CEU Training"],
            },
          ]),
        },
      });
    }

    return NextResponse.json({ success: true, about });
  } catch (error: unknown) {
    console.error("Error fetching about section:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
