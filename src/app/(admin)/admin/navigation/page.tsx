"use client";

import React, { useState, useEffect } from "react";
import {
  Compass,
  Save,
  Loader2,
  CheckCircle,
  Eye,
  EyeOff,
  Sliders,
  Layers,
  HeartHandshake,
  Home,
  Info,
  Activity,
  PhoneCall,
  Image as ImageIcon,
  BookOpen,
} from "lucide-react";
import {
  DEFAULT_PAGE_SECTIONS,
  PageSectionsMap,
  PageKey,
  normalizeAllPageSections,
} from "@/lib/page-visibility";

interface NavItem {
  id: string;
  label: string;
  href: string;
  isVisible: boolean;
}

const PAGE_CONFIG: Record<
  PageKey,
  {
    name: string;
    badge: string;
    desc: string;
    icon: React.ComponentType<{ className?: string }>;
    sections: Array<{ key: string; label: string; desc: string }>;
  }
> = {
  home: {
    name: "Home Page",
    badge: "/",
    desc: "Controls content blocks displayed on the main homepage layout.",
    icon: Home,
    sections: [
      { key: "hero", label: "Hero Banner Slider", desc: "Top headline, rotating images & CTA buttons" },
      { key: "about", label: "About Clinic Preview", desc: "Founding clinical mission and credentials" },
      { key: "careApproach", label: "Care Approach Section", desc: "6 RBA standards & clinical pillars cards" },
      { key: "services", label: "Core Therapy Services", desc: "Preview grid of active therapy programs" },
      { key: "process", label: "Intake Process Steps", desc: "How families start clinical therapy" },
      { key: "gallery", label: "Sensory Gym Gallery", desc: "Facility and therapy room photos preview" },
      { key: "testimonials", label: "Parent Testimonials", desc: "Family reviews and ratings above footer" },
    ],
  },
  about: {
    name: "About Us Page",
    badge: "/about",
    desc: "Controls sections on the About Us facility and leadership page.",
    icon: Info,
    sections: [
      { key: "hero", label: "Top Hero Banner", desc: "Page headline, photo background & badge" },
      { key: "facility", label: "Purpose-Built Facility & Spaces", desc: "Clinic photos, sensory gym features, clinic intro" },
      { key: "team", label: "Our Clinical Team", desc: "RBA clinical director, supervisors & specialists" },
      { key: "pillars", label: "4 Clinical Pillars", desc: "Multidisciplinary, RBA supervised, evidence-based care" },
      { key: "ctaBanner", label: "Bottom Consultation CTA", desc: "Book facility tour banner at bottom of page" },
    ],
  },
  services: {
    name: "Services Page",
    badge: "/services",
    desc: "Controls sections on the Clinical Services directory page.",
    icon: Activity,
    sections: [
      { key: "hero", label: "Top Hero Banner", desc: "Services headline and inquiry button" },
      { key: "servicesGrid", label: "All Therapy Programs Grid", desc: "Comprehensive cards for ABA, SLP, OT, and Life Skills" },
      { key: "ctaBanner", label: "Bottom Assessment CTA", desc: "Need guidance for your child CTA banner" },
    ],
  },
  contact: {
    name: "Contact Us Page",
    badge: "/contact",
    desc: "Controls sections on the Contact and Appointment booking page.",
    icon: PhoneCall,
    sections: [
      { key: "hero", label: "Top Hero Banner", desc: "Contact page headline and information badge" },
      { key: "bookingForm", label: "Book an Appointment Form", desc: "Inquiry form with DDL multi-select & compact map" },
      { key: "hoursCard", label: "Hours, Location & WhatsApp Card", desc: "Operating hours, physical address and instant chat" },
    ],
  },
  gallery: {
    name: "Gallery Page",
    badge: "/gallery",
    desc: "Controls sections on the Facility & Clinic photo showcase page.",
    icon: ImageIcon,
    sections: [
      { key: "hero", label: "Top Hero Banner", desc: "Gallery title and facility introduction" },
      { key: "categoryFilter", label: "Category Filter Buttons", desc: "All, ABA Therapy, Sensory Gym, Group Rooms pills" },
      { key: "photoGrid", label: "Photo Showcase Grid", desc: "Image grid with high-resolution lightbox preview" },
      { key: "ctaBanner", label: "Book Facility Tour CTA", desc: "Visit our sensory gym in person CTA banner" },
    ],
  },
  blogs: {
    name: "Articles & Blog Page",
    badge: "/blogs",
    desc: "Controls sections on the Articles, Guides, and Blog directory page.",
    icon: BookOpen,
    sections: [
      { key: "hero", label: "Top Hero Banner", desc: "Articles header and autism resources intro" },
      { key: "featuredBlog", label: "Featured Article Highlight", desc: "Large spotlight card for the top clinical guide" },
      { key: "blogGrid", label: "Recent Articles Grid", desc: "Article cards with read times and pagination" },
      { key: "newsletterCta", label: "Parent Guide / Newsletter CTA", desc: "Free parent guide download banner" },
    ],
  },
};

export default function AdminNavigationPage() {
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [pageSections, setPageSections] = useState<PageSectionsMap>(DEFAULT_PAGE_SECTIONS);
  const [activeTab, setActiveTab] = useState<PageKey>("home");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchNavigation = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/navigation");
      if (res.ok) {
        const data = await res.json();
        if (data.navItems) setNavItems(data.navItems);
        if (data.pageSections) {
          setPageSections(normalizeAllPageSections(data.pageSections));
        } else if (data.sectionsVisibility) {
          setPageSections(normalizeAllPageSections({ home: data.sectionsVisibility }));
        }
      }
    } catch (err) {
      console.error("Failed to load navigation settings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNavigation();
  }, []);

  const saveChanges = async (
    items: NavItem[],
    allPageSecs: PageSectionsMap,
    showToast: boolean = true
  ) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/navigation", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          navItems: items,
          pageSections: allPageSecs,
          sectionsVisibility: allPageSecs.home,
        }),
      });

      if (res.ok) {
        if (showToast) {
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 3000);
        }
      } else {
        const data = await res.json().catch(() => ({}));
        alert(`Failed to save: ${data.error || "Please login again or check connection."}`);
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("Network error: Failed to save navigation settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleNavVisibility = (id: string) => {
    const updated = navItems.map((item) =>
      item.id === id ? { ...item, isVisible: !item.isVisible } : item
    );
    setNavItems(updated);
    saveChanges(updated, pageSections, true);
  };

  const handleLabelChange = (id: string, newLabel: string) => {
    setNavItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, label: newLabel } : item))
    );
  };

  const handleTogglePageSection = (page: PageKey, sectionKey: string) => {
    const currentPageSecs = pageSections[page] as Record<string, boolean>;
    const currentVal = currentPageSecs[sectionKey] !== false;
    const updatedPageSecs = {
      ...currentPageSecs,
      [sectionKey]: !currentVal,
    };

    const updatedAllPages: PageSectionsMap = {
      ...pageSections,
      [page]: updatedPageSecs,
    } as PageSectionsMap;

    setPageSections(updatedAllPages);
    saveChanges(navItems, updatedAllPages, true);
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    saveChanges(navItems, pageSections, true);
  };

  const visibleNavLinks = navItems.filter((i) => i.isVisible);
  const currentTabConfig = PAGE_CONFIG[activeTab];
  const currentTabSections = (pageSections[activeTab] || {}) as Record<string, boolean>;
  const activeSectionsCount = currentTabConfig.sections.filter(
    (s) => currentTabSections[s.key] !== false
  ).length;

  return (
    <div className="space-y-6 select-none max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/90 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Compass className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Website Navigation & Page Sections Controls
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Toggle visibility of header menu items and individual page sections across the entire website.
          </p>
        </div>

        {saveSuccess && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Saved & Applied to Live Site!</span>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">
            Loading Navigation Settings...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Controls: Navbar & Multi-Page Sections */}
            <div className="lg:col-span-7 space-y-8">
              {/* Part 1: Navbar Links */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-5">
                <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <Compass className="w-5 h-5 text-blue-600" />
                      <h2 className="font-extrabold text-sm text-slate-900">
                        Public Header Navigation Links (Navbar Menu)
                      </h2>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      Controls only which links show in the top header menu. Does not disable or hide the actual page.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Auto-Saves Instantly
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">
                      {visibleNavLinks.length} Active in Header
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {navItems.map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        item.isVisible
                          ? "bg-white border-slate-200"
                          : "bg-slate-50/70 border-slate-200/50 opacity-60"
                      }`}
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={item.label}
                            onChange={(e) => handleLabelChange(item.id, e.target.value)}
                            onBlur={() => saveChanges(navItems, pageSections, true)}
                            className="p-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 max-w-xs"
                          />
                          <span className="text-[10px] font-mono text-slate-400 font-bold">
                            {item.href}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleNavVisibility(item.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                            item.isVisible
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                              : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                          }`}
                        >
                          {item.isVisible ? (
                            <>
                              <Eye className="w-3.5 h-3.5" />
                              <span>Visible in Header</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5" />
                              <span>Hidden from Header</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Part 2: Multi-Page Sections Visibility Controls */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
                <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <Sliders className="w-5 h-5 text-teal-600" />
                      <h2 className="font-extrabold text-sm text-slate-900">
                        Page Content & Sections Visibility Controls
                      </h2>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      Enable or disable any section across all public website pages.
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                    Auto-Saves Instantly
                  </span>
                </div>

                {/* Page Selection Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {(Object.keys(PAGE_CONFIG) as PageKey[]).map((pKey) => {
                    const cfg = PAGE_CONFIG[pKey];
                    const Icon = cfg.icon;
                    const isActive = activeTab === pKey;
                    const pSections = (pageSections[pKey] || {}) as Record<string, boolean>;
                    const countActive = cfg.sections.filter((s) => pSections[s.key] !== false).length;

                    return (
                      <button
                        key={pKey}
                        type="button"
                        onClick={() => setActiveTab(pKey)}
                        className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                          isActive
                            ? "bg-slate-900 text-white shadow-md shadow-slate-900/20 scale-[1.02]"
                            : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80"
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${isActive ? "text-sky-400" : "text-slate-400"}`} />
                        <span>{cfg.name}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {countActive}/{cfg.sections.length}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Tab Header Description */}
                <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200/70 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-black text-blue-950 block">{currentTabConfig.name}</span>
                    <span className="text-[11px] text-blue-700 font-medium">{currentTabConfig.desc}</span>
                  </div>
                  <span className="text-[11px] font-bold bg-white text-blue-800 border border-blue-200 px-2.5 py-1 rounded-xl shrink-0 shadow-2xs">
                    {activeSectionsCount} of {currentTabConfig.sections.length} Active
                  </span>
                </div>

                {/* Section Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {currentTabConfig.sections.map((sec) => {
                    const isVisible = currentTabSections[sec.key] !== false;
                    return (
                      <div
                        key={sec.key}
                        onClick={() => handleTogglePageSection(activeTab, sec.key)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 select-none ${
                          isVisible
                            ? "bg-white border-emerald-200/90 shadow-xs hover:border-emerald-300"
                            : "bg-slate-50 border-slate-200 opacity-60 hover:opacity-80"
                        }`}
                      >
                        <div className="space-y-0.5">
                          <p className="font-extrabold text-slate-900">{sec.label}</p>
                          <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{sec.desc}</p>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shrink-0 ${
                            isVisible
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : "bg-slate-200 text-slate-600 border border-slate-300"
                          }`}
                        >
                          {isVisible ? "✓ Active" : "✕ Disabled"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Save Button with Realtime Feedback */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                {saveSuccess && (
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black animate-in fade-in slide-in-from-bottom-2 duration-200 shadow-xs">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>✓ Settings Saved & Applied to Live Site!</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => handleSave()}
                  disabled={isSaving}
                  className={`inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-xs font-extrabold uppercase tracking-wider shadow-lg transition-all cursor-pointer ${
                    saveSuccess
                      ? "bg-emerald-600 text-white shadow-emerald-600/30"
                      : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30 active:scale-95"
                  } disabled:opacity-50`}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Settings...</span>
                    </>
                  ) : saveSuccess ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Saved Successfully!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save All Settings</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right: Mockup Header & Active Page Section Stack */}
            <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4 sticky top-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-1.5 text-slate-700 font-extrabold text-xs">
                  <Eye className="w-4 h-4 text-blue-600" />
                  <span>Public Navigation Preview</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">Live Preview</span>
              </div>

              {/* Simulated Browser Navbar */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                      <HeartHandshake className="w-4 h-4" />
                    </div>
                    <span className="font-black text-slate-900 text-xs">RADIANT</span>
                  </div>

                  <span className="px-2 py-0.5 rounded-lg bg-blue-600 text-white text-[9px] font-extrabold">
                    Book Call
                  </span>
                </div>

                {/* Simulated Menu Links */}
                <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-1.5">
                  {visibleNavLinks.map((item) => (
                    <span
                      key={item.id}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 text-[10px] font-bold shadow-2xs"
                    >
                      {item.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Simulated Page Sections Flow */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    {currentTabConfig.name} Section Stack
                  </span>
                  <span className="text-[10px] font-mono text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-md">
                    {currentTabConfig.badge}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs font-bold">
                  {currentTabConfig.sections.map((s, idx) => {
                    const isVisible = currentTabSections[s.key] !== false;
                    return (
                      <div
                        key={s.key}
                        className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                          isVisible
                            ? "bg-blue-50/70 border-blue-200 text-blue-900"
                            : "bg-slate-50 border-slate-200 text-slate-400 line-through opacity-75"
                        }`}
                      >
                        <span>{idx + 1}. {s.label}</span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
                          isVisible ? "bg-blue-100 text-blue-800" : "bg-slate-200 text-slate-600"
                        }`}>
                          {isVisible ? "Active" : "Hidden"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
