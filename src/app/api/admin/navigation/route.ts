import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminToken } from "@/modules/auth/auth.service";
import { DEFAULT_PAGE_SECTIONS, normalizeAllPageSections, invalidateNavCache } from "@/lib/page-visibility";

const DEFAULT_NAV_ITEMS = [
  { id: "home", label: "Home", name: "Home", href: "/", path: "/", isVisible: true },
  { id: "about", label: "About Us", name: "About Us", href: "/about", path: "/about", isVisible: true },
  { id: "services", label: "Services", name: "Services", href: "/services", path: "/services", isVisible: true },
  { id: "gallery", label: "Gallery", name: "Gallery", href: "/gallery", path: "/gallery", isVisible: true },
  { id: "blogs", label: "Articles & Blog", name: "Articles & Blog", href: "/blogs", path: "/blogs", isVisible: true },
  { id: "contact", label: "Contact Us", name: "Contact Us", href: "/contact", path: "/contact", isVisible: true },
];

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

export async function GET() {
  try {
    let nav = await prisma.siteNavigation.findFirst();

    if (!nav) {
      nav = await prisma.siteNavigation.create({
        data: {
          navItemsJson: JSON.stringify(DEFAULT_NAV_ITEMS),
          sectionsVisibilityJson: JSON.stringify(DEFAULT_PAGE_SECTIONS),
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
      parsedSections = nav.sectionsVisibilityJson ? JSON.parse(nav.sectionsVisibilityJson) : DEFAULT_PAGE_SECTIONS;
    } catch {
      parsedSections = DEFAULT_PAGE_SECTIONS;
    }

    const normalizedPageSections = normalizeAllPageSections(parsedSections);

    return NextResponse.json({
      success: true,
      navItems: normalizeNavItems(parsedNavItems),
      sectionsVisibility: normalizedPageSections.home, // backwards compat
      pageSections: normalizedPageSections, // all pages map
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
    const { navItems, sectionsVisibility, pageSections } = body;

    const normalizedItems = normalizeNavItems(navItems);

    let combinedSections = pageSections;
    if (!combinedSections && sectionsVisibility) {
      combinedSections = { home: sectionsVisibility };
    }
    const normalizedPageSections = normalizeAllPageSections(combinedSections);

    const payload = {
      navItemsJson: JSON.stringify(normalizedItems),
      sectionsVisibilityJson: JSON.stringify(normalizedPageSections),
    };

    let existing = await prisma.siteNavigation.findFirst();
    if (existing) {
      await prisma.siteNavigation.update({
        where: { id: existing.id },
        data: payload,
      });
    } else {
      await prisma.siteNavigation.create({
        data: payload,
      });
    }

    invalidateNavCache();

    return NextResponse.json({
      success: true,
      navItems: normalizedItems,
      sectionsVisibility: normalizedPageSections.home,
      pageSections: normalizedPageSections,
    });
  } catch (error: unknown) {
    console.error("Error updating site navigation:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
