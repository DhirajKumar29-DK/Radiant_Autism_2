import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminToken } from "@/modules/auth/auth.service";

const DEFAULT_NAV_ITEMS = [
  { id: "home", label: "Home", name: "Home", href: "/", path: "/", isVisible: true },
  { id: "about", label: "About Us", name: "About Us", href: "/about", path: "/about", isVisible: true },
  { id: "services", label: "Services", name: "Services", href: "/services", path: "/services", isVisible: true },
  { id: "gallery", label: "Gallery", name: "Gallery", href: "/gallery", path: "/gallery", isVisible: true },
  { id: "blogs", label: "Articles & Blog", name: "Articles & Blog", href: "/blogs", path: "/blogs", isVisible: true },
  { id: "contact", label: "Contact Us", name: "Contact Us", href: "/contact", path: "/contact", isVisible: true },
];

const DEFAULT_SECTIONS_VISIBILITY = {
  hero: true,
  about: true,
  careApproach: true,
  services: true,
  process: true,
  gallery: true,
};

function normalizeNavItems(raw: any[]): any[] {
  if (!Array.isArray(raw)) return DEFAULT_NAV_ITEMS;

  return raw.map((item: any, idx: number) => {
    const label = item.label || item.name || "Page";
    const href = item.href || item.path || "/";
    const id = item.id || `nav-${href.replace(/[^a-z0-9]/gi, "") || idx}`;
    const isVisible = item.isVisible !== undefined ? Boolean(item.isVisible) : true;

    return {
      id,
      label,
      name: label,
      href,
      path: href,
      isVisible,
    };
  });
}

function normalizeSections(raw: any): any {
  if (!raw || typeof raw !== "object") return DEFAULT_SECTIONS_VISIBILITY;

  return {
    hero: raw.hero !== undefined ? Boolean(raw.hero) : (raw.heroSlider !== undefined ? Boolean(raw.heroSlider) : true),
    about: raw.about !== undefined ? Boolean(raw.about) : (raw.aboutSummary !== undefined ? Boolean(raw.aboutSummary) : true),
    careApproach: raw.careApproach !== undefined ? Boolean(raw.careApproach) : (raw.ourApproach !== undefined ? Boolean(raw.ourApproach) : true),
    services: raw.services !== undefined ? Boolean(raw.services) : (raw.servicesGrid !== undefined ? Boolean(raw.servicesGrid) : true),
    process: raw.process !== undefined ? Boolean(raw.process) : true,
    gallery: raw.gallery !== undefined ? Boolean(raw.gallery) : (raw.galleryPreview !== undefined ? Boolean(raw.galleryPreview) : true),
  };
}

export async function GET() {
  try {
    let nav = await prisma.siteNavigation.findFirst();

    if (!nav) {
      nav = await prisma.siteNavigation.create({
        data: {
          navItemsJson: JSON.stringify(DEFAULT_NAV_ITEMS),
          sectionsVisibilityJson: JSON.stringify(DEFAULT_SECTIONS_VISIBILITY),
        },
      });
    }

    let parsedNavItems: any[] = [];
    try {
      parsedNavItems = JSON.parse(nav.navItemsJson);
    } catch {
      parsedNavItems = DEFAULT_NAV_ITEMS;
    }

    let parsedSections: any = {};
    try {
      parsedSections = nav.sectionsVisibilityJson ? JSON.parse(nav.sectionsVisibilityJson) : DEFAULT_SECTIONS_VISIBILITY;
    } catch {
      parsedSections = DEFAULT_SECTIONS_VISIBILITY;
    }

    return NextResponse.json({
      success: true,
      navItems: normalizeNavItems(parsedNavItems),
      sectionsVisibility: normalizeSections(parsedSections),
    });
  } catch (error: unknown) {
    console.error("Error fetching site navigation:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get("admin_token")?.value;
    if (!token || !verifyAdminToken(token)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { navItems, sectionsVisibility } = body;

    const normalizedItems = normalizeNavItems(navItems);
    const normalizedSections = normalizeSections(sectionsVisibility);

    const payload = {
      navItemsJson: JSON.stringify(normalizedItems),
      sectionsVisibilityJson: JSON.stringify(normalizedSections),
    };

    let existing = await prisma.siteNavigation.findFirst();
    let updated;
    if (existing) {
      updated = await prisma.siteNavigation.update({
        where: { id: existing.id },
        data: payload,
      });
    } else {
      updated = await prisma.siteNavigation.create({
        data: payload,
      });
    }

    return NextResponse.json({
      success: true,
      navItems: normalizedItems,
      sectionsVisibility: normalizedSections,
    });
  } catch (error: unknown) {
    console.error("Error updating site navigation:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
