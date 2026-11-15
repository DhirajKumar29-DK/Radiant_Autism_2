import React from "react";
import type { Metadata } from "next";
import AdminLayout from "@/components/layout/AdminLayout";

export const metadata: Metadata = {
  title: "Clinical Portal | Radiant Autism Center Admin",
  description: "Radiant Autism & Skill Center Clinical Administration & Management System",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
