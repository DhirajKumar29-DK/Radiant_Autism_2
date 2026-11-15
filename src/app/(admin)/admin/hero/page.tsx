"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Sparkles,
  Save,
  Loader2,
  Image as ImageIcon,
  CheckCircle,
  Home,
  Info,
  Layers,
  PhoneCall,
  Plus,
  Trash2,
  Eye,
} from "lucide-react";

interface Slide {
  id: number;
  image: string;
  title: string;
  desc: string;
}

interface HeroData {
  pageKey: string;
  badgeText: string;
  title: string;
  subtitle: string;
  bgImage: string;
  slides: Slide[];
  primaryBtnText: string;
  primaryBtnLink: string;
  secondaryBtnText: string;
  secondaryBtnLink: string;
}

const PAGE_TABS = [
  { key: "home", label: "Home Page Hero", icon: Home },
  { key: "about", label: "About Us Hero", icon: Info },
  { key: "services", label: "Services Hero", icon: Layers },
  { key: "contact", label: "Contact Hero", icon: PhoneCall },
];

export default function AdminHeroPage() {
  const [activeTab, setActiveTab] = useState<string>("home");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const [formData, setFormData] = useState<HeroData>({
    pageKey: "home",
    badgeText: "",
    title: "",
    subtitle: "",
    bgImage: "/hero_child_therapy.jpg",
    slides: [],
    primaryBtnText: "",
    primaryBtnLink: "",
    secondaryBtnText: "",
    secondaryBtnLink: "",
  });

  const fetchHeroData = async (pageKey: string) => {
    setIsLoading(true);
    setSaveSuccess(false);
    try {
      const res = await fetch(`/api/admin/hero?pageKey=${pageKey}`);
      if (res.ok) {
        const data = await res.json();
        if (data.hero) {
          let parsedSlides: Slide[] = [];
          try {
            if (data.hero.slidesJson) {
              parsedSlides = JSON.parse(data.hero.slidesJson);
            }
          } catch {
            parsedSlides = [];
          }

          setFormData({
            pageKey: data.hero.pageKey,
            badgeText: data.hero.badgeText || "",
            title: data.hero.title || "",
            subtitle: data.hero.subtitle || "",
            bgImage: data.hero.bgImage || "/hero_child_therapy.jpg",
            slides: parsedSlides,
            primaryBtnText: data.hero.primaryBtnText || "",
            primaryBtnLink: data.hero.primaryBtnLink || "",
            secondaryBtnText: data.hero.secondaryBtnText || "",
            secondaryBtnLink: data.hero.secondaryBtnLink || "",
          });
        }
      }
    } catch (err) {
      console.error("Failed to load hero data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHeroData(activeTab);
  }, [activeTab]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const payload = {
        ...formData,
        pageKey: activeTab,
        slidesJson: JSON.stringify(formData.slides),
      };

      const res = await fetch("/api/admin/hero", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert("Failed to save page hero");
      }
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSlide = () => {
    const newSlide: Slide = {
      id: Date.now(),
      image: "/hero_child_therapy.jpg",
      title: "New Therapy Program",
      desc: "Compassionate clinical support for children and families.",
    };
    setFormData((prev) => ({
      ...prev,
      slides: [...prev.slides, newSlide],
    }));
  };

  const handleUpdateSlide = (index: number, field: keyof Slide, value: string) => {
    setFormData((prev) => {
      const updated = [...prev.slides];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, slides: updated };
    });
  };

  const handleRemoveSlide = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      slides: prev.slides.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Page Heroes & Banners Manager
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Update headlines, subheadings, background photos, and slider slides for Home, About, Services, and Contact pages.
          </p>
        </div>

        {saveSuccess && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Changes Saved Successfully!</span>
          </div>
        )}
      </div>

      {/* Tabs Selector */}
      <div className="flex items-center gap-2 p-1.5 bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-x-auto scrollbar-none">
        {PAGE_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">
            Loading Hero Data...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Form Editor */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-600">
                Editing Section
              </span>
              <h2 className="text-lg font-black text-slate-900 capitalize tracking-tight mt-0.5">
                {activeTab} Page Hero Settings
              </h2>
            </div>

            <form onSubmit={handleSave} className="space-y-5 text-xs">
              {/* Badge Text */}
              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                  Badge Pill Text
                </label>
                <input
                  type="text"
                  value={formData.badgeText}
                  onChange={(e) => setFormData((prev) => ({ ...prev, badgeText: e.target.value }))}
                  placeholder="e.g. Registered Behaviour Analyst Supervised Care"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                  Hero Headline Title *
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Main large headline displayed on the page hero..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Subtitle */}
              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                  Hero Subtitle / Description
                </label>
                <textarea
                  rows={3}
                  value={formData.subtitle}
                  onChange={(e) => setFormData((prev) => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="Supporting descriptive paragraph..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Background Image (For About, Services, Contact) */}
              {activeTab !== "home" && (
                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                    Banner Background Image Path
                  </label>
                  <input
                    type="text"
                    value={formData.bgImage}
                    onChange={(e) => setFormData((prev) => ({ ...prev, bgImage: e.target.value }))}
                    placeholder="e.g. /hero_child_therapy.jpg or https://..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              )}

              {/* Buttons (Primary & Secondary CTA) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                    Primary Button Text
                  </label>
                  <input
                    type="text"
                    value={formData.primaryBtnText}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, primaryBtnText: e.target.value }))
                    }
                    placeholder="e.g. Book Free Consultation"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <input
                    type="text"
                    value={formData.primaryBtnLink}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, primaryBtnLink: e.target.value }))
                    }
                    placeholder="Link: e.g. /contact"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-600 text-[11px] mt-1"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                    Secondary Button Text
                  </label>
                  <input
                    type="text"
                    value={formData.secondaryBtnText}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, secondaryBtnText: e.target.value }))
                    }
                    placeholder="e.g. Explore Programs"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <input
                    type="text"
                    value={formData.secondaryBtnLink}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, secondaryBtnLink: e.target.value }))
                    }
                    placeholder="Link: e.g. /services"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-600 text-[11px] mt-1"
                  />
                </div>
              </div>

              {/* Home Page Slider Slides Manager */}
              {activeTab === "home" && (
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm">
                        Homepage Hero Slider Slides
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Manage slides cycling through the main homepage background
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddSlide}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Slide</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.slides.map((slide, idx) => (
                      <div
                        key={slide.id || idx}
                        className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-700 text-xs">Slide #{idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSlide(idx)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-slate-500">
                              Image URL / Path
                            </label>
                            <input
                              type="text"
                              value={slide.image}
                              onChange={(e) => handleUpdateSlide(idx, "image", e.target.value)}
                              className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono text-slate-700 text-xs"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-slate-500">
                              Slide Title
                            </label>
                            <input
                              type="text"
                              value={slide.title}
                              onChange={(e) => handleUpdateSlide(idx, "title", e.target.value)}
                              className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 text-xs"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-slate-500">
                            Slide Caption / Description
                          </label>
                          <input
                            type="text"
                            value={slide.desc}
                            onChange={(e) => handleUpdateSlide(idx, "desc", e.target.value)}
                            className="w-full p-2 bg-white border border-slate-200 rounded-xl text-slate-700 text-xs"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold uppercase tracking-wider shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>Save {activeTab} Hero Changes</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right: Live Visual Preview Card */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4 sticky top-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-1.5 text-slate-700 font-extrabold text-xs">
                <Eye className="w-4 h-4 text-blue-600" />
                <span>Live Hero Preview</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 uppercase">
                {activeTab} Hero Banner
              </span>
            </div>

            {/* Simulated Banner Container */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 text-white min-h-[340px] flex flex-col justify-end p-6 border border-slate-800 shadow-md">
              <div className="absolute inset-0 z-0">
                <img
                  src={
                    activeTab === "home"
                      ? formData.slides[0]?.image || "/hero_child_therapy.jpg"
                      : formData.bgImage || "/hero_child_therapy.jpg"
                  }
                  alt="Banner preview"
                  className="w-full h-full object-cover opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
              </div>

              <div className="relative z-10 space-y-3">
                {formData.badgeText && (
                  <span className="inline-block px-3 py-1 rounded-full bg-blue-600/80 text-white text-[10px] font-black uppercase tracking-wider backdrop-blur-xs">
                    {formData.badgeText}
                  </span>
                )}

                <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  {formData.title || "Hero Headline Title"}
                </h3>

                <p className="text-xs text-slate-300 font-medium line-clamp-3 leading-relaxed">
                  {formData.subtitle || "Supporting descriptive paragraph will appear here."}
                </p>

                <div className="pt-2 flex flex-wrap gap-2">
                  {formData.primaryBtnText && (
                    <span className="px-4 py-2 rounded-xl bg-blue-600 text-white text-[11px] font-extrabold shadow-sm">
                      {formData.primaryBtnText}
                    </span>
                  )}
                  {formData.secondaryBtnText && (
                    <span className="px-4 py-2 rounded-xl bg-white/20 text-white text-[11px] font-extrabold backdrop-blur-xs">
                      {formData.secondaryBtnText}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 font-medium text-center">
              Real-time rendering reflects your form inputs above.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
