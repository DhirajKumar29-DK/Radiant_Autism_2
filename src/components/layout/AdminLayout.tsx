"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Brain,
  Star,
  Building,
  Users,
  Image as ImageIcon,
  BookOpen,
  Sliders,
  Menu,
  X,
  LogOut,
  ExternalLink,
  Loader2,
  ShieldCheck,
  User,
  ChevronDown,
} from "lucide-react";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

function AdminSidebarNav({
  navigation,
  openMenu,
  setOpenMenu,
  setSidebarOpen,
}: {
  navigation: any[];
  openMenu: string | null;
  setOpenMenu: (menu: string | null) => void;
  setSidebarOpen: (open: boolean) => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || (pathname === "/admin/about" ? "overview" : "");

  return (
    <nav className="space-y-1">
      {navigation.map((item) => {
        const hasChildren = item.children && item.children.length > 0;
        const isDirectActive =
          item.href === "/admin"
            ? pathname === "/admin"
            : item.href
            ? pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(`${item.href}`))
            : false;

        const isChildActive = hasChildren
          ? item.children!.some((c: any) => {
              const [cBase, cQuery] = c.href.split("?");
              if (pathname !== cBase) return false;
              if (!cQuery) return !currentTab;
              const params = new URLSearchParams(cQuery);
              const t = params.get("tab");
              return currentTab === t;
            })
          : false;

        const isActive = isDirectActive || isChildActive;
        const isMenuOpen = openMenu === item.name;
        const Icon = item.icon;

        if (hasChildren) {
          return (
            <div key={item.name} className="space-y-0.5">
              {/* Parent Accordion Trigger */}
              <button
                type="button"
                onClick={() =>
                  setOpenMenu(isMenuOpen ? null : item.name)
                }
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-slate-900 text-white border-l-2 border-blue-500"
                    : "text-slate-400 hover:text-white hover:bg-slate-900/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? "text-blue-400" : "text-slate-400"
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                    isMenuOpen ? "rotate-180 text-white" : ""
                  }`}
                />
              </button>

              {/* Dropdown Submenu (DDL) */}
              {isMenuOpen && (
                <div className="pl-7 pr-1 py-1 space-y-0.5 animate-in fade-in slide-in-from-top-1 duration-150">
                  {item.children!.map((child: any) => {
                    const [childBase, childQuery] = child.href.split("?");
                    let activeSub = false;

                    if (pathname === childBase) {
                      if (childQuery) {
                        const params = new URLSearchParams(childQuery);
                        const tabVal = params.get("tab");
                        activeSub = currentTab === tabVal;
                      } else {
                        // child has no query (e.g. /admin/team)
                        activeSub = !currentTab;
                      }
                    }

                    return (
                      <Link
                        key={child.name}
                        href={child.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${
                          activeSub
                            ? "text-blue-300 font-extrabold bg-blue-600/20 border-l-2 border-blue-500 pl-2.5"
                            : "text-slate-400 hover:text-white hover:bg-slate-900/40"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            activeSub ? "bg-blue-400" : "bg-slate-600"
                          }`}
                        />
                        <span className="truncate">{child.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        }

        // Standard Link Item (e.g. Hero Section, Blogs, Dashboard)
        return (
          <Link
            key={item.name}
            href={item.href || "/admin"}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              item.isAmber && isActive
                ? "bg-[#f59e0b] hover:bg-[#d97706] text-black font-black shadow-md shadow-amber-500/20"
                : isActive
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Icon
              className={`w-4 h-4 shrink-0 ${
                item.isAmber && isActive
                  ? "text-black fill-black"
                  : isActive
                  ? "text-white"
                  : "text-slate-400"
              }`}
            />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setAdminUser(data.admin);
          setIsCheckingAuth(false);
        } else {
          router.replace("/login");
        }
      } catch {
        router.replace("/login");
      }
    };
    checkAuth();
  }, [router]);

  const [openMenu, setOpenMenu] = useState<string | null>("About Section");

  useEffect(() => {
    if (pathname?.startsWith("/admin/about") || pathname?.startsWith("/admin/team")) {
      setOpenMenu("About Section");
    } else if (pathname?.startsWith("/admin/services")) {
      setOpenMenu("Clinical Programs");
    } else if (pathname?.startsWith("/admin/gallery")) {
      setOpenMenu("Facility Gallery");
    } else {
      setOpenMenu(null);
    }
  }, [pathname]);

  interface NavChild {
    name: string;
    href: string;
  }

  interface NavItemConfig {
    name: string;
    href?: string;
    icon: any;
    children?: NavChild[];
    isAmber?: boolean;
  }

  const navigation: NavItemConfig[] = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Blogs", href: "/admin/blogs", icon: BookOpen },
    { name: "Appointments & Inquiries", href: "/admin/inquiries", icon: Calendar },
    { name: "Hero Section", href: "/admin/hero", icon: Star, isAmber: true },
    {
      name: "About Section",
      href: "/admin/about",
      icon: Building,
      children: [
        { name: "Overview & Mission", href: "/admin/about?tab=overview" },
        { name: "Facility Tour & Spaces", href: "/admin/about?tab=facility" },
        { name: "Clinical Leadership & Team", href: "/admin/team" },
        { name: "Clinical Pillars & Care", href: "/admin/about?tab=pillars" },
      ],
    },
    {
      name: "Facility Gallery",
      href: "/admin/gallery",
      icon: ImageIcon,
      children: [
        { name: "All Facility Photos", href: "/admin/gallery" },
        { name: "Sensory Rooms", href: "/admin/gallery" },
        { name: "Clinical Spaces", href: "/admin/gallery" },
      ],
    },
    {
      name: "Clinical Programs",
      href: "/admin/services",
      icon: Brain,
      children: [
        { name: "All Clinical Programs", href: "/admin/services" },
        { name: "Add New Program", href: "/admin/services" },
      ],
    },
    { name: "Navbar & Visibility", href: "/admin/navigation", icon: Sliders },
  ];

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch {
      router.push("/login");
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white select-none">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
        <span className="font-semibold text-slate-400 text-sm">Verifying clinical administrator access...</span>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-slate-50 flex flex-col md:flex-row select-none">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-68 bg-slate-950 border-r border-slate-800 transform transition-transform duration-300 ease-in-out flex flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800/80 bg-slate-950/50">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-white block">
                RADIANT <span className="text-sky-400 font-light">CLINIC</span>
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
                Admin Control
              </span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items List */}
        <div className="flex-1 py-5 px-3.5 overflow-y-auto space-y-1">
          <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest px-3 mb-2">
            Clinical Modules
          </div>
          <Suspense fallback={<div className="p-4 text-xs text-slate-500 font-bold uppercase tracking-wider">Loading menu...</div>}>
            <AdminSidebarNav
              navigation={navigation}
              openMenu={openMenu}
              setOpenMenu={setOpenMenu}
              setSidebarOpen={setSidebarOpen}
            />
          </Suspense>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 space-y-2">
          {/* Back to Public Website */}
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-900 transition-colors w-full"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-sky-400" />
              <span>View Live Website</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">↗</span>
          </Link>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors w-full cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 shrink-0 bg-white border-b border-slate-200/90 flex items-center justify-between px-4 sm:px-8 z-10 shadow-2xs">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Radiant Autism & Skill Center — Management Portal
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* User Profile Badge */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-[10px]">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="hidden sm:block text-left">
                <span className="font-extrabold text-slate-900 block leading-tight">
                  {adminUser?.name || "Admin"}
                </span>
                <span className="text-[9px] text-blue-600 uppercase font-black block leading-none">
                  {adminUser?.role || "Staff"}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Page Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-100/60">
          {children}
        </main>
      </div>
    </div>
  );
}
