import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isPageRouteActive } from "@/lib/page-visibility";
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
  const isPageActive = await isPageRouteActive("/gallery");
  if (!isPageActive) {
    notFound();
  }

  let galleryItems = [];
  let hero = null;
  try {
    const [rawItems, rawHero] = await Promise.all([
      prisma.galleryItem.findMany({
        where: {
          isActive: true,
          isDeleted: false,
        },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      }),
      prisma.hero.findFirst({
        where: { pageKey: "gallery", status: "ACTIVE" },
        orderBy: { displayOrder: "asc" },
      }),
    ]);
    galleryItems = JSON.parse(JSON.stringify(rawItems));
    if (rawHero) {
      hero = JSON.parse(JSON.stringify(rawHero));
    }
  } catch (error) {
    console.error("Error fetching gallery items/hero:", error);
  }

  return <GalleryClient initialItems={galleryItems} initialHero={hero} />;
}
