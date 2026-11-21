import prisma from "@/lib/prisma";

// High-speed in-memory cache for SiteNavigation to avoid repeated 700ms roundtrips to remote MySQL
let cachedNavRecord: any = null;
let lastNavFetchTime = 0;
const NAV_CACHE_TTL = 30 * 1000; // 30 seconds TTL

export function invalidateNavCache() {
  cachedNavRecord = null;
  lastNavFetchTime = 0;
}

export async function getSiteNavigationRecord() {
  const now = Date.now();
  if (cachedNavRecord && now - lastNavFetchTime < NAV_CACHE_TTL) {
    return cachedNavRecord;
  }

  try {
    const nav = await prisma.siteNavigation.findFirst();
    cachedNavRecord = nav;
    lastNavFetchTime = now;
    return nav;
  } catch (err) {
    console.error("Error fetching siteNavigation:", err);
    return cachedNavRecord;
  }
}

export async function isPageRouteActive(routePath: string): Promise<boolean> {
  try {
    const nav = await getSiteNavigationRecord();
    if (!nav || !nav.navItemsJson) {
      return true; // Default to active if no configuration exists
    }

    let navItems: any[] = [];
    try {
      navItems = JSON.parse(nav.navItemsJson);
    } catch {
      return true;
    }

    if (!Array.isArray(navItems)) {
      return true;
    }

    // Normalize path to check (e.g. "/about")
    const cleanPath = routePath.split("?")[0].replace(/\/+$/, "") || "/";

    const match = navItems.find((item: any) => {
      const itemHref = (item.href || item.path || "").split("?")[0].replace(/\/+$/, "") || "/";
      if (cleanPath === "/") {
        return itemHref === "/";
      }
      return itemHref === cleanPath || (cleanPath.startsWith(itemHref) && itemHref !== "/");
    });

    if (match && match.isVisible === false) {
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error checking page route visibility:", err);
    return true;
  }
}

export const DEFAULT_PAGE_SECTIONS = {
  home: {
    hero: true,
    about: true,
    careApproach: true,
    services: true,
    process: true,
    gallery: true,
    testimonials: true,
  },
  about: {
    hero: true,
    facility: true,
    team: true,
    pillars: true,
    ctaBanner: true,
  },
  services: {
    hero: true,
    servicesGrid: true,
    ctaBanner: true,
  },
  contact: {
    hero: true,
    bookingForm: true,
    hoursCard: true,
  },
  gallery: {
    hero: true,
    categoryFilter: true,
    photoGrid: true,
    ctaBanner: true,
  },
  blogs: {
    hero: true,
    featuredBlog: true,
    blogGrid: true,
    newsletterCta: true,
  },
};

export type PageSectionsMap = typeof DEFAULT_PAGE_SECTIONS;
export type PageKey = keyof PageSectionsMap;

export function normalizeAllPageSections(raw: any): PageSectionsMap {
  if (!raw || typeof raw !== "object") {
    return DEFAULT_PAGE_SECTIONS;
  }

  // If old flat structure was saved (only home sections)
  const homeObj = raw.home && typeof raw.home === "object" ? raw.home : raw;

  return {
    home: {
      hero: homeObj.hero !== undefined ? Boolean(homeObj.hero) : true,
      about: homeObj.about !== undefined ? Boolean(homeObj.about) : true,
      careApproach: homeObj.careApproach !== undefined ? Boolean(homeObj.careApproach) : true,
      services: homeObj.services !== undefined ? Boolean(homeObj.services) : true,
      process: homeObj.process !== undefined ? Boolean(homeObj.process) : true,
      gallery: homeObj.gallery !== undefined ? Boolean(homeObj.gallery) : true,
      testimonials: homeObj.testimonials !== undefined ? Boolean(homeObj.testimonials) : true,
    },
    about: {
      hero: raw.about?.hero !== undefined ? Boolean(raw.about.hero) : true,
      facility: raw.about?.facility !== undefined ? Boolean(raw.about.facility) : true,
      team: raw.about?.team !== undefined ? Boolean(raw.about.team) : true,
      pillars: raw.about?.pillars !== undefined ? Boolean(raw.about.pillars) : true,
      ctaBanner: raw.about?.ctaBanner !== undefined ? Boolean(raw.about.ctaBanner) : true,
    },
    services: {
      hero: raw.services?.hero !== undefined ? Boolean(raw.services.hero) : true,
      servicesGrid: raw.services?.servicesGrid !== undefined ? Boolean(raw.services.servicesGrid) : true,
      ctaBanner: raw.services?.ctaBanner !== undefined ? Boolean(raw.services.ctaBanner) : true,
    },
    contact: {
      hero: raw.contact?.hero !== undefined ? Boolean(raw.contact.hero) : true,
      bookingForm: raw.contact?.bookingForm !== undefined ? Boolean(raw.contact.bookingForm) : true,
      hoursCard: raw.contact?.hoursCard !== undefined ? Boolean(raw.contact.hoursCard) : true,
    },
    gallery: {
      hero: raw.gallery?.hero !== undefined ? Boolean(raw.gallery.hero) : true,
      categoryFilter: raw.gallery?.categoryFilter !== undefined ? Boolean(raw.gallery.categoryFilter) : true,
      photoGrid: raw.gallery?.photoGrid !== undefined ? Boolean(raw.gallery.photoGrid) : true,
      ctaBanner: raw.gallery?.ctaBanner !== undefined ? Boolean(raw.gallery.ctaBanner) : true,
    },
    blogs: {
      hero: raw.blogs?.hero !== undefined ? Boolean(raw.blogs.hero) : true,
      featuredBlog: raw.blogs?.featuredBlog !== undefined ? Boolean(raw.blogs.featuredBlog) : true,
      blogGrid: raw.blogs?.blogGrid !== undefined ? Boolean(raw.blogs.blogGrid) : true,
      newsletterCta: raw.blogs?.newsletterCta !== undefined ? Boolean(raw.blogs.newsletterCta) : true,
    },
  };
}

export async function getPageSections<K extends PageKey>(pageKey: K): Promise<PageSectionsMap[K]> {
  try {
    const nav = await getSiteNavigationRecord();
    if (!nav || !nav.sectionsVisibilityJson) {
      return DEFAULT_PAGE_SECTIONS[pageKey];
    }

    let parsed: any = {};
    try {
      parsed = JSON.parse(nav.sectionsVisibilityJson);
    } catch {
      return DEFAULT_PAGE_SECTIONS[pageKey];
    }

    const normalized = normalizeAllPageSections(parsed);
    return normalized[pageKey];
  } catch (err) {
    console.error(`Error loading section visibility for page '${pageKey}':`, err);
    return DEFAULT_PAGE_SECTIONS[pageKey];
  }
}
