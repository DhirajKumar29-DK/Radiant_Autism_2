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
} from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  href: string;
  isVisible: boolean;
}

interface SectionsVisibility {
  hero: boolean;
  about: boolean;
  careApproach: boolean;
  services: boolean;
  testimonials?: boolean;
  process: boolean;
  gallery: boolean;
}

export default function AdminNavigationPage() {
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [sections, setSections] = useState<SectionsVisibility>({
    hero: true,
    about: true,
    careApproach: true,
    services: true,
    testimonials: true,
    process: true,
    gallery: true,
  });

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
        if (data.sectionsVisibility) setSections(data.sectionsVisibility);
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
    secs: SectionsVisibility,
    showToast: boolean = true
  ) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/navigation", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          navItems: items,
          sectionsVisibility: secs,
        }),
      });

      if (res.ok) {
        if (showToast) {
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 2500);
        }
      } else {
        alert("Failed to save navigation settings");
      }
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleNavVisibility = (id: string) => {
    const updated = navItems.map((item) =>
      item.id === id ? { ...item, isVisible: !item.isVisible } : item
    );
    setNavItems(updated);
    saveChanges(updated, sections, true);
  };

  const handleLabelChange = (id: string, newLabel: string) => {
    setNavItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, label: newLabel } : item))
    );
  };

  const handleToggleSection = (sectionKey: keyof SectionsVisibility) => {
    const updated = {
      ...sections,
      [sectionKey]: !sections[sectionKey],
    };
    setSections(updated);
    saveChanges(navItems, updated, true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveChanges(navItems, sections, true);
  };

  const visibleNavLinks = navItems.filter((item) => item.isVisible);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Page Structure & Navigation
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-extrabold text-xs">
              Live Website Controls
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Choose which links appear on the public header and which content sections are displayed on the homepage.
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
            {/* Left Controls: Navbar & Sections */}
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
                            onBlur={() => saveChanges(navItems, sections, true)}
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

              {/* Part 2: Homepage Sections Visibility */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-5">
                <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <Sliders className="w-5 h-5 text-teal-600" />
                      <h2 className="font-extrabold text-sm text-slate-900">
                        Homepage Scroll Sections Visibility
                      </h2>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      Controls which content blocks appear on the homepage scroll layout.
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Auto-Saves Instantly
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {[
                    { key: "hero", label: "Hero Banner Slider", desc: "Top headline & booking CTA" },
                    { key: "about", label: "About Clinic Preview", desc: "Founding clinical mission" },
                    { key: "careApproach", label: "Care Approach Section", desc: "RBA philosophy & pillars" },
                    { key: "services", label: "Core Services Cards", desc: "ABA, Speech, OT cards" },
                    { key: "process", label: "Intake Process Steps", desc: "How families start therapy" },
                    { key: "gallery", label: "Sensory Gym Gallery", desc: "Facility photos preview" },
                    { key: "testimonials", label: "Parent Testimonials", desc: "Family reviews above footer" },
                  ].map((sec) => {
                    const isVisible = sections[sec.key as keyof SectionsVisibility];
                    return (
                      <div
                        key={sec.key}
                        onClick={() => handleToggleSection(sec.key as keyof SectionsVisibility)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                          isVisible
                            ? "bg-white border-emerald-200/80 shadow-xs hover:border-emerald-300"
                            : "bg-slate-50 border-slate-200 opacity-60 hover:opacity-80"
                        }`}
                      >
                        <div>
                          <p className="font-extrabold text-slate-900">{sec.label}</p>
                          <p className="text-[11px] text-slate-500 font-medium">{sec.desc}</p>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
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

              {/* Save Button */}
              <div className="flex items-center justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold uppercase tracking-wider shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>Save Navigation Settings</span>
                </button>
              </div>
            </div>

            {/* Right: Mockup Header & Site Preview */}
            <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4 sticky top-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-1.5 text-slate-700 font-extrabold text-xs">
                  <Eye className="w-4 h-4 text-blue-600" />
                  <span>Public Header Mockup</span>
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

              {/* Simulated Homepage Sections Flow */}
              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Homepage Section Stack
                </span>
                <div className="space-y-1.5 text-xs font-bold">
                  {[
                    { key: "hero", label: "1. Hero Banner" },
                    { key: "about", label: "2. About Clinic" },
                    { key: "careApproach", label: "3. Care Approach" },
                    { key: "services", label: "4. Services Cards" },
                    { key: "process", label: "5. Clinical Process" },
                    { key: "gallery", label: "6. Sensory Gallery" },
                    { key: "testimonials", label: "7. Parent Reviews (Above Footer)" },
                  ].map((s) => {
                    const isVisible = sections[s.key as keyof SectionsVisibility];
                    return (
                      <div
                        key={s.key}
                        className={`p-2.5 rounded-xl border flex items-center justify-between ${
                          isVisible
                            ? "bg-blue-50/60 border-blue-200 text-blue-900"
                            : "bg-slate-50 border-slate-200 text-slate-400 line-through"
                        }`}
                      >
                        <span>{s.label}</span>
                        <span className="text-[10px] font-mono">
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
