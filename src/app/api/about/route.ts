import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    let about = await prisma.aboutSection.findFirst();

    if (!about) {
      about = await prisma.aboutSection.create({
        data: {
          badgeText: "ABOUT RADIANT AUTISM & SKILL CENTER",
          title: "Compassionate, Modern & Person-Centered Care For Every Child",
          description1:
            "At Radiant Autism Center, our mission is simple: to help every child build meaningful communication, motor independence, and daily life confidence through gentle, evidence-based care.",
          description2:
            "We work closely with families to deliver individualized support across ABA therapy, speech-language services, and occupational therapy in a welcoming, caring environment.",
          centerImage: "/about_center_photo.jpg",
          highlightsJson: JSON.stringify([
            "Registered Behaviour Analyst (RBA, Ontario) Supervision",
            "OAP Covered Programs & Services",
            "Person-Centered & Compassionate ABA Therapy",
            "Integrated Speech & Occupational Therapy Support",
            "Tailored 1:1 and Group Skill Building",
            "Close Family Collaboration & Parent Guidance",
          ]),
          facilityHeading: "Modern Sensory-Rich Clinical Environment",
          facilityDesc:
            "Our clinic features custom sensory gyms, private 1:1 intervention suites, gross-motor play zones, and parent observation rooms designed for safety, focus, and warmth.",
          facilityImage: "/gallery_sensory_gym.jpg",
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
