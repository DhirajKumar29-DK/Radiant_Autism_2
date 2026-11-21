"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import ImageUploadField from "@/components/admin/ImageUploadField";
import ConfirmModal from "@/components/common/ConfirmModal";
import {
  Plus,
  Edit3,
  Trash2,
  X,
  Loader2,
  CheckCircle,
  Building,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";

type StatusType = "ACTIVE" | "INACTIVE" | "DRAFT";

interface AboutData {
  id?: string;
  badgeText: string;
  imageBadge?: string;
  title: string;
  description: string;
  centerImage: string;
  highlights: string[];
  status: StatusType;
  updatedAt?: string;
}

export default function AdminAboutOverviewPage() {
  const [about, setAbout] = useState<AboutData>({
    badgeText: "ABOUT RADIANT AUTISM & SKILL CENTER",
    imageBadge: "OAP Covered Services",
    title: "Dedicated Clinical Support for Every Child's Unique Potential",
    description:
      "Radiant Autism & Skill Center is a multidisciplinary pediatric clinic dedicated to delivering research-backed, compassionate developmental therapies.",
    centerImage: "/about_center_photo.jpg",
    highlights: [
      "100% RBA Supervised Clinical Programs",
      "Eligible for Ontario Autism Program (OAP) funding",
      "Individualized 1:1 and peer-group social rooms",
      "Family-centered progress reporting and collaboration",
    ],
    status: "ACTIVE",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Checkbox Selection & Bulk Actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State inside Modal
  const [formData, setFormData] = useState({
    badgeText: "",
    imageBadge: "OAP Covered Services",
    title: "",
    description: "",
    centerImage: "/about_center_photo.jpg",
    highlights: [] as string[],
    status: "ACTIVE" as StatusType,
  });
  const [newHighlight, setNewHighlight] = useState("");
  const [editingHighlightIndex, setEditingHighlightIndex] = useState<number | null>(null);
  const [editingHighlightValue, setEditingHighlightValue] = useState("");

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

          const singleDesc =
            data.about.description1 || data.about.description2
              ? [data.about.description1, data.about.description2].filter(Boolean).join("\n\n")
              : "";

          setAbout({
            id: data.about.id,
            badgeText: data.about.badgeText || "ABOUT RADIANT AUTISM & SKILL CENTER",
            imageBadge: data.about.imageBadge || "OAP Covered Services",
            title: data.about.title || "Dedicated Clinical Support for Every Child's Unique Potential",
            description: singleDesc,
            centerImage: data.about.centerImage || "/about_center_photo.jpg",
            highlights: parsedHighlights,
            status: (data.about.status as StatusType) || "ACTIVE",
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
      imageBadge: about.imageBadge || "OAP Covered Services",
      title: about.title,
      description: about.description,
      centerImage: about.centerImage || "/about_center_photo.jpg",
      highlights: [...about.highlights],
      status: about.status || "ACTIVE",
    });
    setNewHighlight("");
    setEditingHighlightIndex(null);
    setEditingHighlightValue("");
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
    if (editingHighlightIndex === index) {
      setEditingHighlightIndex(null);
      setEditingHighlightValue("");
    }
  };

  const handleStartEditHighlight = (index: number, text: string) => {
    setEditingHighlightIndex(index);
    setEditingHighlightValue(text);
  };

  const handleSaveEditHighlight = (index: number) => {
    if (!editingHighlightValue.trim()) return;
    setFormData((prev) => {
      const copy = [...prev.highlights];
      copy[index] = editingHighlightValue.trim();
      return { ...prev, highlights: copy };
    });
    setEditingHighlightIndex(null);
    setEditingHighlightValue("");
  };

  const handleCancelEditHighlight = () => {
    setEditingHighlightIndex(null);
    setEditingHighlightValue("");
  };

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedIds.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds([about.id || "about-1"]);
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Quick Status Toggle directly from table
  const cycleStatus = async () => {
    const nextStatus: StatusType =
      about.status === "ACTIVE"
        ? "INACTIVE"
        : about.status === "INACTIVE"
        ? "DRAFT"
        : "ACTIVE";

    try {
      const res = await fetch("/api/admin/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setAbout((prev) => ({ ...prev, status: nextStatus }));
      }
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  // Delete / Soft-Delete Handler
  const executeDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch("/api/admin/about", {
        method: "DELETE",
      });
      if (res.ok) {
        setAbout((prev) => ({
          ...prev,
          status: "INACTIVE",
        }));
        setSelectedIds([]);
        setIsConfirmOpen(false);
      } else {
        alert("Failed to delete about section");
      }
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setIsDeleting(false);
    }
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
          imageBadge: formData.imageBadge,
          title: formData.title,
          description: formData.description,
          centerImage: formData.centerImage,
          highlights: formData.highlights,
          status: formData.status,
          isDeleted: false,
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

  const renderStatusBadge = (st: StatusType) => {
    switch (st) {
      case "ACTIVE":
        return (
          <button
            type="button"
            onClick={cycleStatus}
            title="Click to cycle status (ACTIVE -> INACTIVE -> DRAFT)"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            ACTIVE
          </button>
        );
      case "INACTIVE":
        return (
          <button
            type="button"
            onClick={cycleStatus}
            title="Click to cycle status (INACTIVE -> DRAFT -> ACTIVE)"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-slate-100 text-slate-600 border border-slate-300 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            INACTIVE
          </button>
        );
      case "DRAFT":
        return (
          <button
            type="button"
            onClick={cycleStatus}
            title="Click to cycle status (DRAFT -> ACTIVE -> INACTIVE)"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            DRAFT
          </button>
        );
      default:
        return null;
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

        <div className="flex items-center gap-3">
          {/* Bulk Delete Button when items selected */}
          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={() => setIsConfirmOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition-all animate-in fade-in cursor-pointer"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>Delete Selected ({selectedIds.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={openEditModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold uppercase tracking-wider shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Edit About Entry</span>
          </button>
        </div>
      </div>

      {/* Main Table View (FabFit Style with Select All & Actions) */}
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
                  <th className="py-4 pl-6 pr-2 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </th>
                  <th className="py-4 px-4 w-12 text-center">#</th>
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
                  <td className="py-4 pl-6 pr-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(about.id || "about-1")}
                      onChange={() => toggleSelectOne(about.id || "about-1")}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </td>

                  <td className="py-4 px-4 font-bold text-slate-400 text-center">1</td>

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

                  {/* Dynamic Status with Quick Cycle */}
                  <td className="py-4 px-6">
                    {renderStatusBadge(about.status)}
                  </td>

                  <td className="py-4 px-6 font-semibold text-slate-500">
                    {formatUpdatedAt(about.updatedAt)}
                  </td>

                  {/* Dual Action Buttons: Edit AND Delete */}
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={openEditModal}
                        title="Edit About Overview"
                        className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200/80 transition-all inline-flex items-center justify-center font-bold cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsConfirmOpen(true)}
                        title="Delete"
                        className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 transition-all inline-flex items-center justify-center font-bold cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
                  Update status, clinic headline, single mission description, photo, and highlights.
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

              {/* SINGLE DESCRIPTION (Preserves all paragraph line breaks) */}
              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                  Description * (Press Enter for Paragraph Spacing)
                </label>
                <textarea
                  rows={5}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Type your introductory mission statements. Press Enter twice for separate paragraphs..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm leading-relaxed"
                />
              </div>

              {/* Center Photo Upload with New Segmented Switcher */}
              <ImageUploadField
                label="Center Showcase Photo"
                value={formData.centerImage}
                onChange={(url) => setFormData((prev) => ({ ...prev, centerImage: url }))}
                placeholder="/about_center_photo.jpg"
                helpText="Upload a high-resolution clinic photo from your computer or provide a URL."
              />

              {/* Photo Floating Badge (e.g. OAP Covered Services) */}
              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                  Photo Floating Badge Tag (Image ke upar ka badge)
                </label>
                <input
                  type="text"
                  value={formData.imageBadge}
                  onChange={(e) => setFormData((prev) => ({ ...prev, imageBadge: e.target.value }))}
                  placeholder="e.g. OAP Covered Services"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                />
                <span className="text-[11px] text-slate-400 font-medium">
                  Ye badge showcase photo ke top-left floating tag me dikhta hai (Home & About dono page pe).
                </span>
              </div>

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

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {formData.highlights.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl border transition-all ${
                        editingHighlightIndex === idx
                          ? "bg-blue-50/80 border-blue-300 ring-2 ring-blue-500/20"
                          : "bg-slate-50 border border-slate-200/80 hover:border-slate-300"
                      }`}
                    >
                      {editingHighlightIndex === idx ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editingHighlightValue}
                            onChange={(e) => setEditingHighlightValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleSaveEditHighlight(idx);
                              } else if (e.key === "Escape") {
                                handleCancelEditHighlight();
                              }
                            }}
                            autoFocus
                            className="flex-1 px-3 py-1.5 bg-white border border-blue-400 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEditHighlight(idx)}
                            title="Save changes"
                            className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEditHighlight}
                            title="Cancel"
                            className="p-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-600 transition-colors cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 flex-1">
                            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                            <span>{item}</span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleStartEditHighlight(idx, item)}
                              title="Edit Highlight"
                              className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveHighlight(idx)}
                              title="Delete Highlight"
                              className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Dropdown */}
              <div className="space-y-1.5 pt-3 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-800">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, status: e.target.value as StatusType }))
                  }
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="DRAFT">Draft</option>
                </select>
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
                    className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-extrabold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer ${
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

      {/* CONFIRM DELETION MODAL */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={executeDelete}
        isDeleting={isDeleting}
        itemCount={selectedIds.length > 0 ? selectedIds.length : 1}
        title="Confirm Deletion"
        message="Are you sure you want to delete this? Please confirm to proceed."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
