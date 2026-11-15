import prisma from "@/lib/prisma";
import { SERVICES_DATA, ServiceDetail } from "@/data/servicesData";

export async function getServiceBySlug(slug: string): Promise<ServiceDetail | null> {
  // 1. Try fetching from Prisma DB
  try {
    const dbSvc = await prisma.service.findFirst({
      where: { slug, isActive: true },
    });

    if (dbSvc) {
      let overviewParagraphs: string[] = [];
      try {
        if (dbSvc.overviewParagraphs) {
          const parsed = JSON.parse(dbSvc.overviewParagraphs);
          overviewParagraphs = Array.isArray(parsed) ? parsed : [dbSvc.overviewParagraphs];
        }
      } catch {
        overviewParagraphs = dbSvc.overviewParagraphs ? [dbSvc.overviewParagraphs] : [];
      }

      let features: string[] = [];
      try {
        if (dbSvc.features) {
          const parsed = JSON.parse(dbSvc.features);
          features = Array.isArray(parsed) ? parsed : [];
        }
      } catch {
        features = [];
      }

      let whoNeedsThis = {
        subtitle: `${dbSvc.title} is recommended if your child demonstrates:`,
        signs: [
          "Needs individualized pediatric clinical support",
          "Developing verbal and functional communication",
          "Working towards independence in daily life activities",
        ],
      };
      try {
        if (dbSvc.whoNeedsThis) {
          whoNeedsThis = JSON.parse(dbSvc.whoNeedsThis);
        }
      } catch {}

      let keyBenefits = [
        {
          title: "Targeted Clinical Growth",
          description: "Evidence-based pediatric therapy tailored to developmental milestones.",
        },
        {
          title: "Registered Clinical Supervision",
          description: "Supervised by certified behavioral therapists and clinicians.",
        },
      ];
      try {
        if (dbSvc.keyBenefits) {
          keyBenefits = JSON.parse(dbSvc.keyBenefits);
        }
      } catch {}

      let faqs: { question: string; answer: string }[] = [];
      try {
        if (dbSvc.faqs) {
          faqs = JSON.parse(dbSvc.faqs);
        }
      } catch {}

      return {
        id: dbSvc.slug,
        title: dbSvc.title,
        tagline: dbSvc.tagline || "",
        badge: dbSvc.badge || "Clinical Care",
        badgeBg: dbSvc.badgeBg || "bg-blue-600",
        iconBg: dbSvc.iconBg || "bg-blue-600",
        bulletColor: dbSvc.bulletColor || "text-blue-600",
        iconName: (dbSvc.iconName as any) || "Brain",
        image: dbSvc.image || "/hero_child_therapy.jpg",
        heroImage: dbSvc.image || "/hero_child_therapy.jpg",
        shortDescription: dbSvc.shortDescription || dbSvc.tagline || "",
        overviewParagraphs:
          overviewParagraphs.length > 0
            ? overviewParagraphs
            : [dbSvc.shortDescription || ""],
        ageGroup: dbSvc.ageGroup || "2 to 20 Years",
        sessionFormat: dbSvc.sessionFormat || "1:1 Individualized Clinical Sessions",
        duration: dbSvc.duration || "Customized Care Plan",
        clinicalLead: dbSvc.clinicalLead || "Registered Clinical Team",
        features: features.length > 0 ? features : ["Individualized Care Plan", "Clinical Supervision"],
        whoNeedsThis,
        keyBenefits,
        clinicalProcess: [
          {
            stepNumber: "01",
            title: "Intake & Clinical Assessment",
            description: "Thorough developmental baseline evaluation by our clinical team.",
          },
          {
            stepNumber: "02",
            title: "Individualized Goal Setting",
            description: "Targeting socially significant milestones customized for your child.",
          },
          {
            stepNumber: "03",
            title: "Ongoing Therapy & Data Tracking",
            description: "Continuous progress monitoring, parent updates, and program refinement.",
          },
        ],
        faqs,
      };
    }
  } catch (err) {
    console.error("Error reading service from database:", err);
  }

  // 2. Fallback to static SERVICES_DATA
  return SERVICES_DATA[slug] || null;
}

export async function getAllActiveServices() {
  try {
    const dbServices = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });

    if (dbServices.length > 0) {
      return dbServices.map((svc) => {
        let features: string[] = [];
        try {
          if (svc.features) {
            const parsed = JSON.parse(svc.features);
            features = Array.isArray(parsed) ? parsed : [];
          }
        } catch {
          features = [];
        }

        return {
          id: svc.slug,
          title: svc.title,
          badge: svc.badge || "Clinical Care",
          badgeBg: svc.badgeBg || "bg-blue-600",
          iconBg: svc.iconBg || "bg-blue-600",
          bulletColor: svc.bulletColor || "text-blue-600",
          iconName: svc.iconName || "Brain",
          image: svc.image || "/hero_child_therapy.jpg",
          imgAlt: svc.title,
          description: svc.shortDescription || svc.tagline || "",
          features:
            features.length > 0
              ? features
              : ["RBA Supervised Care", "Individualized Goals", "Developmental Support"],
        };
      });
    }
  } catch (err) {
    console.error("Error fetching active services from DB:", err);
  }

  // Fallback to static services
  return null;
}
