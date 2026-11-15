import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminToken } from "@/modules/auth/auth.service";

const DEFAULT_NAV_ITEMS = [
  { id: "home", label: "Home", href: "/", isVisible: true },
  { id: "about", label: "About Us", href: "/about", isVisible: true },
  { id: "services", label: "Services", href: "/services", isVisible: true },
  { id: "gallery", label: "Gallery", href: "/gallery", isVisible: true },
  { id: "blogs", label: "Articles & Blog", href: "/blogs", isVisible: true },
  { id: "contact", label: "Contact Us", href: "/contact", isVisible: true },
];

const DEFAULT_SECTIONS_VISIBILITY = {
  hero: true,
  about: true,
  careApproach: true,
  services: true,
  process: true,
  gallery: true,
};

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

    return NextResponse.json({
      success: true,
      navItems: JSON.parse(nav.navItemsJson),
      sectionsVisibility: nav.sectionsVisibilityJson
        ? JSON.parse(nav.sectionsVisibilityJson)
        : DEFAULT_SECTIONS_VISIBILITY,
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

    const payload = {
      navItemsJson:
        typeof navItems === "string" ? navItems : JSON.stringify(navItems || DEFAULT_NAV_ITEMS),
      sectionsVisibilityJson:
        typeof sectionsVisibility === "string"
          ? sectionsVisibility
          : JSON.stringify(sectionsVisibility || DEFAULT_SECTIONS_VISIBILITY),
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
      navItems: JSON.parse(updated.navItemsJson),
      sectionsVisibility: updated.sectionsVisibilityJson
        ? JSON.parse(updated.sectionsVisibilityJson)
        : DEFAULT_SECTIONS_VISIBILITY,
    });
  } catch (error: unknown) {
    console.error("Error updating site navigation:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
