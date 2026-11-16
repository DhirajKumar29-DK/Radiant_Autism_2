import prisma from "@/lib/prisma";

export async function isPageRouteActive(routePath: string): Promise<boolean> {
  try {
    const nav = await prisma.siteNavigation.findFirst();
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
