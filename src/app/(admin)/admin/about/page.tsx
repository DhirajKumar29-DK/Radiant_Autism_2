"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import ImageUploadField from "@/components/admin/ImageUploadField";
import {
  Plus,
  Edit,
  Edit3,
  Trash2,
  X,
  Loader2,
  CheckCircle,
  Building,
  Sparkles,
  Save,
  CheckCircle2,
} from "lucide-react";

interface AboutData {
  id?: string;
  badgeText: string;
  title: string;
  description: string;
  centerImage: string;
  highlights: string[];
  updatedAt?: string;
}

export default function AdminAboutOverviewPage() {
  const [about, setAbout] = useState<AboutData>({
    badgeText: "ABOUT RADIANT AUTISM & SKILL CENTER",
    title: "Compassionate, Modern & Person-Centered Care For Every Child",
    description:
      "At Radiant Autism Center, our mission is simple: to help every child build meaningful communication, motor independence, and daily life confidence through gentle, evidence-based care.",
    centerImage: "/about_center_photo.jpg",
    highlights: [
      "Registered Behaviour Analyst (RBA, Ontario) Supervision",
      "OAP Covered Programs & Services",
      "Person-Centered & Compassionate ABA Therapy",
      "Integrated Speech & Occupational Therapy Support",
      "Tailored 1:1 and Group Skill Building",
      "Close Family Collaboration & Parent Guidance",
    ],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form State inside Modal
  const [formData, setFormData] = useState({
    badgeText: "",
    title: "",
    description: "",
    centerImage: "/about_center_photo.jpg",
    highlights: [] as string[],
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
          if (data.about.highlightsJson) {
            try {
              const p = JSON.parse(data.about.highlightsJson);
              if (Array.isArray(p)) parsedHighlights = p;
            } catch (e) {
              console.error(e);
            }
          }

          // Single description: use description1 or description1 + description2
          const singleDesc =
            data.about.description1 || data.about.description2
              ? [data.about.description1, data.about.description2].filter(Boolean).join(" ")
              : "";

          setAbout({
            id: data.about.id,
            badgeText: data.about.badgeText || "ABOUT RADIANT AUTISM & SKILL CENTER",
            title: data.about.title || "Dedicated Clinical Support for Every Child's Unique Potential",
            description: singleDesc,
            centerImage: data.about.centerImage || "/about_center_photo.jpg",
            highlights: parsedHighlights,
            updatedAt: data.about.updatedAt,
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

  const openEditModal = () => {
    setFormData({
      badgeText: about.badgeText,
      title: about.title,
      description: about.description,
      centerImage: about.centerImage || "/about_center_photo.jpg",
      highlights: [...about.highlights],
    });
    setNewHighlight("");
    setSaveSuccess(false);
    setIsModalOpen(true);
  };

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

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/admin/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          badgeText: formData.badgeText,
          title: formData.title,
          description: formData.description, // Single description saved
          centerImage: formData.centerImage,
          highlights: formData.highlights,
        }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        await fetchAboutData();
        setTimeout(() => {
          setIsModalOpen(false);
          setSaveSuccess(false);
        }, 1200);
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || "Failed to save about section");
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("Network or server error while saving");
    } finally {
      setIsSaving(false);
    }
  };

  const formatUpdatedAt = (dateStr?: string) => {
    if (!dateStr) return "Just now";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            About Section
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Manage homepage and clinic about section overview content
          </p>
        </div>

        <button
          type="button"
          onClick={openEditModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold uppercase tracking-wider shadow-lg shadow-blue-600/25 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Edit About Entry</span>
        </button>
      </div>

      {/* Main Table View (FabFit Style) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">
              Loading Overview Content...
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6 w-12 text-center">#</th>
                  <th className="py-4 px-6">Badge</th>
                  <th className="py-4 px-6">Heading</th>
                  <th className="py-4 px-6">Center Image</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Updated At</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-400 text-center">1</td>

                  <td className="py-4 px-6 font-bold text-slate-900 max-w-xs">
                    <span className="inline-block px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-[11px] font-extrabold border border-blue-100">
                      {about.badgeText || "About Center"}
                    </span>
                  </td>

                  <td className="py-4 px-6 font-extrabold text-slate-800 max-w-md">
                    <p className="line-clamp-2 leading-relaxed">{about.title}</p>
                    <p className="text-[11px] font-medium text-slate-400 mt-0.5 line-clamp-1">
                      {about.description}
                    </p>
                  </td>

                  <td className="py-4 px-6">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative shrink-0">
                      <Image
                        src={about.centerImage || "/about_center_photo.jpg"}
                        alt="Center Showcase"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      ACTIVE
                    </span>
                  </td>

                  <td className="py-4 px-6 font-semibold text-slate-500">
                    {formatUpdatedAt(about.updatedAt)}
                  </td>

                  <td className="py-4 px-6 text-right">
                    <button
                      type="button"
                      onClick={openEditModal}
                      title="Edit About Overview"
                      className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200/80 transition-all inline-flex items-center gap-1.5 font-bold"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span className="text-[11px]">Edit</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* POPUP MODAL (Clean Dialog on Button Click) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-100">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  Edit About Overview & Mission
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Update the clinic headline, single mission description, photo, and highlights.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                  Badge Tagline
                </label>
                <input
                  type="text"
                  value={formData.badgeText}
                  onChange={(e) => setFormData((prev) => ({ ...prev, badgeText: e.target.value }))}
                  placeholder="e.g. ABOUT RADIANT AUTISM & SKILL CENTER"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
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
                  placeholder="e.g. Compassionate, Modern & Person-Centered Care For Every Child"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                />
              </div>

              {/* SINGLE DESCRIPTION (No Paragraph 1 and 2 split) */}
              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                  Description *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="At Radiant Autism Center, our mission is simple: to help every child build meaningful communication, motor independence, and daily life confidence through gentle, evidence-based care..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm leading-relaxed"
                />
              </div>

              {/* Center Photo Upload */}
              <ImageUploadField
                label="Center Showcase Photo"
                value={formData.centerImage}
                onChange={(url) => setFormData((prev) => ({ ...prev, centerImage: url }))}
                placeholder="/about_center_photo.jpg"
                helpText="Upload a high-resolution clinic photo from your system (computer)."
              />

              {/* Clinical Highlights Bullets */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                    Core Clinical Highlights (Bullets)
                  </label>
                  <span className="text-[11px] font-bold text-slate-400">
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
                    className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 shrink-0"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {formData.highlights.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 gap-3"
                    >
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 flex-1">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>{item}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveHighlight(idx)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  {saveSuccess && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                      <CheckCircle className="w-4 h-4" />
                      Saved Successfully!
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-extrabold uppercase tracking-wider transition-all disabled:opacity-50 ${
                      saveSuccess
                        ? "bg-emerald-600 text-white"
                        : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30"
                    }`}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : saveSuccess ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Saved!</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Overview</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
