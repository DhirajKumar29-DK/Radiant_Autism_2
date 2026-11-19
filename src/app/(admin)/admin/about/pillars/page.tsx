"use client";

import React, { useState, useEffect } from "react";
import ConfirmModal from "@/components/common/ConfirmModal";
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

type StatusType = "ACTIVE" | "INACTIVE" | "DRAFT";

interface PillarItem {
  id: string; // "01", "02", etc.
  title: string;
  badge: string;
  desc: string;
  icon?: string;
  points: string[];
  status?: StatusType;
}

const DEFAULT_PILLARS: PillarItem[] = [
  {
    id: "01",
    title: "Person-Centered ABA",
    badge: "Empowerment",
    desc: "Every intervention honors the child's individual personality, dignity, strengths, and natural communication pace.",
    icon: "HeartHandshake",
    points: ["Dignity-first approach", "Positive Reinforcement"],
    status: "ACTIVE",
  },
  {
    id: "02",
    title: "1:1 RBA Supervision",
    badge: "RBA Led",
    desc: "Registered Behaviour Analysts (Ontario) directly design, continuously monitor, and adjust clinical progress for every child.",
    icon: "Award",
    points: ["Certified Clinicians", "VB-MAPP & ABLLS-R"],
    status: "ACTIVE",
  },
  {
    id: "03",
    title: "Multidisciplinary Integration",
    badge: "360° Care",
    desc: "Seamlessly combining speech-language pathology, occupational sensory care, and pediatric physio for holistic development.",
    icon: "Users",
    points: ["Speech + OT + ABA", "Unified Goal Roadmap"],
    status: "ACTIVE",
  },
  {
    id: "04",
    title: "OAP Covered & CEU Programs",
    badge: "Accredited",
    desc: "Clinical center offering OAP eligible family support funding programs and professional clinical development.",
    icon: "ShieldCheck",
    points: ["OAP Covered Services", "Parent CEU Training"],
    status: "ACTIVE",
  },
];

export default function AdminAboutPillarsPage() {
  const [pillars, setPillars] = useState<PillarItem[]>(DEFAULT_PILLARS);
  const [isLoading, setIsLoading] = useState(true);
  const [modalMode, setModalMode] = useState<"ADD" | "EDIT" | null>(null);
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Selection & Bulk Action
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [deleteTargetIds, setDeleteTargetIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State inside Modal
  const [formData, setFormData] = useState<PillarItem>({
    id: "01",
    title: "",
    badge: "",
    desc: "",
    points: [],
    status: "ACTIVE",
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
              const normalized = parsed.map((item: any, idx: number) => ({
                id: item.id || `0${idx + 1}`,
                title: item.title || "",
                badge: item.badge || "Clinical",
                desc: item.desc || "",
                icon: item.icon || "HeartHandshake",
                points: Array.isArray(item.points) ? item.points : [],
                status: (item.status as StatusType) || "ACTIVE",
              }));
              setPillars(normalized);
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

  const openAddModal = () => {
    const nextNum = pillars.length + 1;
    setFormData({
      id: nextNum < 10 ? `0${nextNum}` : `${nextNum}`,
      title: "",
      badge: "Clinical Care",
      desc: "",
      points: [],
      status: "ACTIVE",
    });
    setEditingIndex(-1);
    setNewSubPoint("");
    setSaveSuccess(false);
    setModalMode("ADD");
  };

  const openEditModal = (index: number) => {
    setEditingIndex(index);
    const item = pillars[index];
    setFormData({
      id: item.id || `0${index + 1}`,
      title: item.title,
      badge: item.badge,
      desc: item.desc,
      icon: item.icon,
      points: [...(item.points || [])],
      status: item.status || "ACTIVE",
    });
    setNewSubPoint("");
    setSaveSuccess(false);
    setModalMode("EDIT");
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

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedIds.length === pillars.length && pillars.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pillars.map((p) => p.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Quick cycle status from table
  const cycleStatus = async (item: PillarItem, index: number) => {
    const nextStatus: StatusType =
      item.status === "ACTIVE"
        ? "INACTIVE"
        : item.status === "INACTIVE"
        ? "DRAFT"
        : "ACTIVE";

    const updated = [...pillars];
    updated[index] = { ...updated[index], status: nextStatus };

    try {
      const res = await fetch("/api/admin/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pillars: updated }),
      });
      if (res.ok) {
        setPillars(updated);
      }
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  // Delete Handlers
  const confirmSingleDelete = (id: string) => {
    setDeleteTargetIds([id]);
    setIsConfirmDeleteOpen(true);
  };

  const confirmBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setDeleteTargetIds(selectedIds);
    setIsConfirmDeleteOpen(true);
  };

  const executeDelete = async () => {
    if (deleteTargetIds.length === 0) return;
    setIsDeleting(true);

    try {
      const remaining = pillars.filter((p) => !deleteTargetIds.includes(p.id));
      const res = await fetch("/api/admin/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pillars: remaining }),
      });

      if (res.ok) {
        setPillars(remaining);
        setSelectedIds([]);
        setIsConfirmDeleteOpen(false);
        setDeleteTargetIds([]);
      } else {
        alert("Failed to delete pillar(s)");
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
      let updatedPillars: PillarItem[];
      if (modalMode === "ADD") {
        updatedPillars = [...pillars, formData];
      } else {
        updatedPillars = [...pillars];
        updatedPillars[editingIndex] = { ...formData };
      }

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
          setModalMode(null);
          setSaveSuccess(false);
        }, 1000);
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

  const renderStatusBadge = (st: StatusType = "ACTIVE", item: PillarItem, index: number) => {
    switch (st) {
      case "ACTIVE":
        return (
          <button
            type="button"
            onClick={() => cycleStatus(item, index)}
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
            onClick={() => cycleStatus(item, index)}
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
            onClick={() => cycleStatus(item, index)}
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
            Clinical Pillars & Care
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Manage the Pillars of Clinical Excellence displayed on the About Us page
          </p>
        </div>

        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={confirmBulkDelete}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>Delete Selected ({selectedIds.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold rounded-2xl shadow-lg shadow-blue-600/30 transition-all uppercase tracking-wider cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Pillar</span>
          </button>
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
        ) : pillars.length === 0 ? (
          <div className="bg-white p-16 rounded-3xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Award className="w-7 h-7" />
            </div>
            <h3 className="text-slate-900 font-bold text-base">No Clinical Pillars Added</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
              Create the 4 foundational pillars of clinical excellence for the clinic.
            </p>
            <button
              type="button"
              onClick={openAddModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
            >
              Add First Pillar
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 pl-6 pr-2 w-10">
                    <input
                      type="checkbox"
                      checked={
                        pillars.length > 0 &&
                        pillars.every((p) => selectedIds.includes(p.id))
                      }
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </th>
                  <th className="py-4 px-4 w-14 text-center">#</th>
                  <th className="py-4 px-6">Badge Pill</th>
                  <th className="py-4 px-6">Pillar Title</th>
                  <th className="py-4 px-6">Description</th>
                  <th className="py-4 px-6">Sub-Points</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {pillars.map((item, idx) => {
                  const isSelected = selectedIds.includes(item.id);

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/50 transition-colors ${
                        isSelected ? "bg-blue-50/30" : ""
                      }`}
                    >
                      <td className="py-4 pl-6 pr-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(item.id)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>

                      <td className="py-4 px-4 text-center font-black">
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

                      {/* Status badge with cycle click */}
                      <td className="py-4 px-6">
                        {renderStatusBadge(item.status || "ACTIVE", item, idx)}
                      </td>

                      {/* Dual Action: Edit + Delete */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(idx)}
                            title="Edit Pillar"
                            className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200/80 transition-all inline-flex items-center gap-1.5 font-bold cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                            <span className="text-[11px]">Edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => confirmSingleDelete(item.id)}
                            title="Delete Pillar"
                            className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 transition-all inline-flex items-center gap-1.5 font-bold cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="text-[11px]">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* POPUP MODAL (Add / Edit) */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-100">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  {modalMode === "ADD" ? "Add Clinical Pillar" : `Edit Clinical Pillar ${formData.id}`}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Update title, category badge, status, clinical description, and sub-points.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalMode(null)}
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
                    placeholder="e.g. 01, 02"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                    Badge Tag *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.badge}
                    onChange={(e) => setFormData((prev) => ({ ...prev, badge: e.target.value }))}
                    placeholder="e.g. Empowerment, RBA Led"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                  Clinical Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.desc}
                  onChange={(e) => setFormData((prev) => ({ ...prev, desc: e.target.value }))}
                  placeholder="Explain how this clinical pillar benefits the children and families..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 leading-relaxed"
                />
              </div>

              {/* Sub Points Editor */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                  Pillar Bullet Points ({formData.points.length})
                </label>

                <div className="flex gap-2">
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
                    placeholder="e.g. Dignity-first approach"
                    className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubPoint}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {formData.points.map((pt, pIdx) => (
                    <div
                      key={pIdx}
                      className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>{pt}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubPoint(pIdx)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status DDL (Publish or Draft at bottom of form) */}
              <div className="space-y-1.5 pt-3 border-t border-slate-100">
                <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                  Pillar Status (Publish or Draft)
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, status: e.target.value as StatusType }))
                  }
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                >
                  <option value="ACTIVE">🟢 Published (Active - Live on website)</option>
                  <option value="DRAFT">🟡 Draft (Hidden / In Progress)</option>
                  <option value="INACTIVE">⚪ Inactive (Deactivated / Hidden)</option>
                </select>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  {saveSuccess && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4" />
                      Saved Successfully!
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setModalMode(null)}
                    className="px-5 py-2.5 rounded-2xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-600/25 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>{modalMode === "ADD" ? "Add Pillar" : "Save Changes"}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={executeDelete}
        title={
          deleteTargetIds.length > 1
            ? `Delete ${deleteTargetIds.length} Clinical Pillars?`
            : "Delete Clinical Pillar?"
        }
        message={
          deleteTargetIds.length > 1
            ? `Are you sure you want to remove the selected ${deleteTargetIds.length} clinical pillars from the About Us page?`
            : "Are you sure you want to delete this clinical pillar?"
        }
        confirmText={
          isDeleting
            ? "Deleting..."
            : deleteTargetIds.length > 1
            ? `Delete ${deleteTargetIds.length} Pillars`
            : "Delete Pillar"
        }
        variant="danger"
      />
    </div>
  );
}
