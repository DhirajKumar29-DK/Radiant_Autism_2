"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit3,
  Trash2,
  X,
  Loader2,
  CheckCircle,
  Save,
  CheckCircle2,
  Award,
  HeartHandshake,
  Users,
  ShieldCheck,
} from "lucide-react";

interface PillarItem {
  id: string; // "01", "02", etc.
  title: string;
  badge: string;
  desc: string;
  icon?: string;
  points: string[];
}

const DEFAULT_PILLARS: PillarItem[] = [
  {
    id: "01",
    title: "Person-Centered ABA",
    badge: "Empowerment",
    desc: "Every intervention honors the child's individual personality, dignity, strengths, and natural communication pace.",
    icon: "HeartHandshake",
    points: ["Dignity-first approach", "Positive Reinforcement"],
  },
  {
    id: "02",
    title: "1:1 RBA Supervision",
    badge: "RBA Led",
    desc: "Registered Behaviour Analysts (Ontario) directly design, continuously monitor, and adjust clinical progress for every child.",
    icon: "Award",
    points: ["Certified Clinicians", "VB-MAPP & ABLLS-R"],
  },
  {
    id: "03",
    title: "Multidisciplinary Integration",
    badge: "360° Care",
    desc: "Seamlessly combining speech-language pathology, occupational sensory care, and pediatric physio for holistic development.",
    icon: "Users",
    points: ["Speech + OT + ABA", "Unified Goal Roadmap"],
  },
  {
    id: "04",
    title: "OAP Covered & CEU Programs",
    badge: "Accredited",
    desc: "Clinical center offering OAP eligible family support funding programs and professional clinical development.",
    icon: "ShieldCheck",
    points: ["OAP Covered Services", "Parent CEU Training"],
  },
];

export default function AdminAboutPillarsPage() {
  const [pillars, setPillars] = useState<PillarItem[]>(DEFAULT_PILLARS);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPillarIndex, setSelectedPillarIndex] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form State inside Modal
  const [formData, setFormData] = useState<PillarItem>({
    id: "01",
    title: "",
    badge: "",
    desc: "",
    points: [],
  });
  const [newSubPoint, setNewSubPoint] = useState("");

  const fetchPillars = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/about");
      if (res.ok) {
        const data = await res.json();
        if (data.about && data.about.pillarsJson) {
          try {
            const parsed = JSON.parse(data.about.pillarsJson);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setPillars(parsed);
            }
          } catch (e) {
            console.error("Error parsing pillarsJson:", e);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load pillars:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPillars();
  }, []);

  const openEditModal = (index: number) => {
    setSelectedPillarIndex(index);
    const item = pillars[index] || DEFAULT_PILLARS[index];
    setFormData({
      id: item.id || `0${index + 1}`,
      title: item.title,
      badge: item.badge,
      desc: item.desc,
      icon: item.icon,
      points: [...(item.points || [])],
    });
    setNewSubPoint("");
    setSaveSuccess(false);
    setIsModalOpen(true);
  };

  const handleAddSubPoint = () => {
    if (!newSubPoint.trim()) return;
    setFormData((prev) => ({
      ...prev,
      points: [...prev.points, newSubPoint.trim()],
    }));
    setNewSubPoint("");
  };

  const handleRemoveSubPoint = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      points: prev.points.filter((_, i) => i !== idx),
    }));
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const updatedPillars = [...pillars];
      updatedPillars[selectedPillarIndex] = {
        ...formData,
      };

      const res = await fetch("/api/admin/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pillars: updatedPillars,
        }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setPillars(updatedPillars);
        setTimeout(() => {
          setIsModalOpen(false);
          setSaveSuccess(false);
        }, 1200);
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || "Failed to save pillar");
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("Network error while saving");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Clinical Pillars & Care
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Manage the 4 Pillars of Clinical Excellence displayed on the About Us page
          </p>
        </div>
      </div>

      {/* Main Table View (FabFit Style) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">
              Loading Clinical Pillars...
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6 w-14 text-center">Pillar</th>
                  <th className="py-4 px-6">Badge Pill</th>
                  <th className="py-4 px-6">Pillar Title</th>
                  <th className="py-4 px-6">Description</th>
                  <th className="py-4 px-6">Sub-Points</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {pillars.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 text-center font-black">
                      <span className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 font-extrabold flex items-center justify-center border border-blue-200/60 mx-auto">
                        {item.id}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <span className="inline-block px-3 py-1 rounded-full bg-blue-600 text-white text-[11px] font-extrabold shadow-xs">
                        {item.badge}
                      </span>
                    </td>

                    <td className="py-4 px-6 font-black text-slate-900 max-w-xs">
                      <p className="text-sm">{item.title}</p>
                    </td>

                    <td className="py-4 px-6 font-medium text-slate-600 max-w-sm">
                      <p className="line-clamp-2 leading-relaxed">{item.desc}</p>
                    </td>

                    <td className="py-4 px-6">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-bold">
                        {item.points?.length || 0} Points
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        ACTIVE
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <button
                        type="button"
                        onClick={() => openEditModal(idx)}
                        title="Edit Pillar"
                        className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200/80 transition-all inline-flex items-center gap-1.5 font-bold"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span className="text-[11px]">Edit</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* POPUP MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-100">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  Edit Clinical Pillar {formData.id}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Update title, category badge, clinical description, and sub-points.
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
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                    Pillar Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.id}
                    onChange={(e) => setFormData((prev) => ({ ...prev, id: e.target.value }))}
                    placeholder="e.g. 01"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                    Category Badge *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.badge}
                    onChange={(e) => setFormData((prev) => ({ ...prev, badge: e.target.value }))}
                    placeholder="e.g. Empowerment"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                  Pillar Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Person-Centered ABA"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                  Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.desc}
                  onChange={(e) => setFormData((prev) => ({ ...prev, desc: e.target.value }))}
                  placeholder="Every intervention honors the child's individual personality, dignity, strengths..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-slate-700 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Sub-Points */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                  Sub-Points / Highlights (2 Points)
                </label>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newSubPoint}
                    onChange={(e) => setNewSubPoint(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSubPoint();
                      }
                    }}
                    placeholder="Add a sub-point and press Enter..."
                    className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubPoint}
                    className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 shrink-0"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {formData.points.map((pt, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80 gap-3"
                    >
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 flex-1">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>{pt}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubPoint(i)}
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
                        <span>Save Pillar</span>
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
