import React from "react";
import type { Metadata } from "next";
import HomeSectionsContainer from "@/components/HomeSectionsContainer";

export const metadata: Metadata = {
  title: "Radiant Autism Center | ABA & Skill Therapy",
  description:
    "OAP covered & RBA supervised Autism Center providing ABA therapy, speech therapy, occupational therapy & early intervention in Ontario.",
  alternates: {
    canonical: "/",
  },
};

export default function HomePage() {
  return <HomeSectionsContainer />;
}
