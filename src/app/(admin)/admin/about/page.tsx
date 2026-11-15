"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Save,
  Loader2,
  CheckCircle,
  Building,
  Sparkles,
  Plus,
  Trash2,
  Eye,
  FileText,
  Activity,
} from "lucide-react";

export default function AdminAboutPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [formData, setFormData] = useState({
    badgeText: "",
    title: "",
    description1: "",
    description2: "",
    centerImage: "/about_center_photo.jpg",
    highlights: [] as string[],
    facilityHeading: "",
    facilityDesc: "",
    facilityImage: "/gallery_sensory_gym.jpg",
  });

  const [newHighlight, setNewHighlight] = useState("");

  const fetchAboutData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/about");
      if (res.ok) {
        const data = await res.json();
        if (data.about) {
          let parsedHighlights: string[] = [];
          try {
            if (data.about.highlightsJson) {
              parsedHighlights = JSON.parse(data.about.highlightsJson);
            }
          } catch {
            parsedHighlights = [];
          }

          setFormData({
            badgeText: data.about.badgeText || "",
            title: data.about.title || "",
            description1: data.about.description1 || "",
            description2: data.about.description2 || "",
            centerImage: data.about.centerImage || "/about_center_photo.jpg",
            highlights: parsedHighlights,
            facilityHeading: data.about.facilityHeading || "",
            facilityDesc: data.about.facilityDesc || "",
            facilityImage: data.about.facilityImage || "/gallery_sensory_gym.jpg",
          });
        }
      }
    } catch (err) {
      console.error("Failed to load about data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAboutData();
  }, []);

  const handleAddHighlight = () => {
    if (!newHighlight.trim()) return;
    setFormData((prev) => ({
      ...prev,
      highlights: [...prev.highlights, newHighlight.trim()],
    }));
    setNewHighlight("");
  };

  const handleRemoveHighlight = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/admin/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert("Failed to save about section");
      }
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            About Clinic & Facility Manager
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Control the About Radiant Autism storytelling, clinical highlights, sensory gym descriptions, and facility photos.
          </p>
        </div>

        {saveSuccess && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Saved Successfully!</span>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">
            Loading About Content...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
            <form onSubmit={handleSave} className="space-y-6 text-xs">
              {/* Part 1: Clinic Overview & Mission */}
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <h2 className="font-extrabold text-sm text-slate-900">
                    Clinic Mission & Philosophy
                  </h2>
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                    Badge Tagline
                  </label>
                  <input
                    type="text"
                    value={formData.badgeText}
                    onChange={(e) => setFormData((prev) => ({ ...prev, badgeText: e.target.value }))}
                    placeholder="e.g. ABOUT RADIANT AUTISM & SKILL CENTER"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                    Headline Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Dedicated Clinical Support for Every Child's Unique Potential"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                    Description Paragraph 1
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description1}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, description1: e.target.value }))
                    }
                    placeholder="Core mission and founding clinical statement..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                    Description Paragraph 2
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description2}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, description2: e.target.value }))
                    }
                    placeholder="RBA supervision details, family collaboration, and growth..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                    Center Showcase Photo Path
                  </label>
                  <input
                    type="text"
                    value={formData.centerImage}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, centerImage: e.target.value }))
                    }
                    placeholder="e.g. /about_center_photo.jpg or https://..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Part 2: Key Clinical Highlights */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                    Core Clinical Highlights (Bullets)
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    {formData.highlights.length} Items
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newHighlight}
                    onChange={(e) => setNewHighlight(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddHighlight();
                      }
                    }}
                    placeholder="Add a new highlight bullet point and press Enter..."
                    className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={handleAddHighlight}
                    className="px-3 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.highlights.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]">
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-slate-800 text-xs">{item}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveHighlight(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Part 3: Sensory Facility & Gym Showcase */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                  <Building className="w-4 h-4 text-teal-600" />
                  <h2 className="font-extrabold text-sm text-slate-900">
                    Sensory Gym & Facility Section
                  </h2>
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                    Facility Section Heading
                  </label>
                  <input
                    type="text"
                    value={formData.facilityHeading}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, facilityHeading: e.target.value }))
                    }
                    placeholder="e.g. Modern Sensory-Rich Clinical Environment"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                    Facility Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.facilityDesc}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, facilityDesc: e.target.value }))
                    }
                    placeholder="Sensory equipment, gross-motor room, parent room details..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-slate-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                    Facility Image Path
                  </label>
                  <input
                    type="text"
                    value={formData.facilityImage}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, facilityImage: e.target.value }))
                    }
                    placeholder="e.g. /gallery_sensory_gym.jpg or https://..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-slate-800"
                  />
                </div>
              </div>

              {/* Save Button */}
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
                  <span>Save About Content</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right: Live Preview */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4 sticky top-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-1.5 text-slate-700 font-extrabold text-xs">
                <Eye className="w-4 h-4 text-blue-600" />
                <span>About Card Preview</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 uppercase">Live Render</span>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                {formData.badgeText && (
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider">
                    {formData.badgeText}
                  </span>
                )}
                <h3 className="text-base font-black text-slate-900 leading-snug">
                  {formData.title || "Headline Title"}
                </h3>
              </div>

              <div className="relative h-44 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                <img
                  src={formData.centerImage || "/about_center_photo.jpg"}
                  alt="About preview"
                  className="w-full h-full object-cover"
                />
              </div>

              <p className="text-slate-600 font-medium leading-relaxed line-clamp-3">
                {formData.description1 || "Description 1 will show here."}
              </p>

              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <span className="text-[10px] font-black uppercase text-slate-400">Highlights</span>
                {formData.highlights.slice(0, 3).map((h, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11px] text-slate-700 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100">
                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <span className="text-[10px] font-extrabold text-teal-700 uppercase">Facility</span>
                  <p className="font-black text-slate-800 text-xs">{formData.facilityHeading}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
