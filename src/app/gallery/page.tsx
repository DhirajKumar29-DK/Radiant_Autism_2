import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isPageRouteActive, getPageSections } from "@/lib/page-visibility";
import GalleryClient from "@/components/GalleryClient";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Facility Gallery | Radiant Autism Center",
  description:
    "View photos of Radiant Autism Center's sensory gym, 1:1 learning rooms, group activity areas, and clinical therapy spaces.",
  alternates: {
    canonical: "/gallery",
  },
  openGraph: {
    title: "Facility Gallery | Radiant Autism Center",
    description:
      "View photos of Radiant Autism Center's sensory gym, 1:1 learning rooms, group activity areas, and clinical therapy spaces.",
    images: ["/gallery_sensory_gym.jpg"],
  },
};

export default async function GalleryPage() {
  const [isPageActive, sections, rawItems, rawHero] = await Promise.all([
    isPageRouteActive("/gallery"),
    getPageSections("gallery"),
    prisma.galleryItem
      .findMany({
        where: { isActive: true, isDeleted: false },
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      })
      .catch(() => []),
    prisma.hero
      .findFirst({
        where: { pageKey: "gallery", status: "ACTIVE" },
        orderBy: { displayOrder: "asc" },
      })
      .catch(() => null),
  ]);

  if (!isPageActive) {
    notFound();
  }

  const galleryItems = JSON.parse(JSON.stringify(rawItems || []));
  const hero = rawHero ? JSON.parse(JSON.stringify(rawHero)) : null;

  return (
    <GalleryClient
      initialItems={galleryItems}
      initialHero={hero}
      initialSections={sections}
    />
  );
}
