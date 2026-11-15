"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // If navigating to Admin panel routes or Login auth page, hide public Navbar and Footer
  const isDashboardOrAuth = pathname?.startsWith("/admin") || pathname === "/login";

  if (isDashboardOrAuth) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
